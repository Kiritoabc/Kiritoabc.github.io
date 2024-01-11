---
title: Go系统监控
author: 菠萝
email: 2493381254@qq.com
readmore: true
hideTime: true
categories: 后端
tag: 后端go
abbrlink: 35291
---



# 系统监控

> 很多系统中都有守护进程，它们能够在后台监控系统的运行状态，在出现意外情况时及时响应。系统监控是 Go 语言运行时的重要组成部分，它会每隔一段时间检查 Go 语言运行时，确保程序没有进入异常状态。本节会介绍 Go 语言系统监控的设计与实现原理，包括它的启动、执行过程以及主要职责。

<!-- more -->



# 设计原理

> 在支持多任务的操作系统中，守护进程是在后台运行的计算机程序，它不会由用户直接操作，它一般会在操作系统启动时自动运行。Kubernetes 的 DaemonSet 和 Go 语言的系统监控都使用类似设计提供一些通用的功能：

![1699621512779](go系统监控/1699621512779.png)

守护进程是很有效的设计，它在整个系统的生命周期中都会存在，会随着系统的启动而启动，系统的结束而结束。在操作系统和 Kubernetes 中，我们经常会将数据库服务、日志服务以及监控服务等进程作为守护进程运行。

Go 语言的系统监控也起到了很重要的作用，它在内部启动了一个不会中止的循环，在循环的内部会轮询网络、抢占长期运行或者处于系统调用的 Goroutine 以及触发垃圾回收，通过这些行为，它能够让系统的运行状态变得更健康。



# 监控循环

当 Go 语言程序启动时，运行时会在第一个 Goroutine 中调用 [`runtime.main`](https://draveness.me/golang/tree/runtime.main) 启动主程序，该函数会在系统栈中创建新的线程：

~~~go
func main() {
	...
	if GOARCH != "wasm" {
		systemstack(func() {
			newm(sysmon, nil)
		})
	}
	...
}
~~~

[`runtime.newm`](https://draveness.me/golang/tree/runtime.newm) 会创建一个存储待执行函数和处理器的新结构体 [`runtime.m`](https://draveness.me/golang/tree/runtime.m)。运行时执行系统监控不需要处理器，系统监控的 Goroutine 会直接在创建的线程上运行：

~~~go
func newm(fn func(), _p_ *p) {
	mp := allocm(_p_, fn)
	mp.nextp.set(_p_)
	mp.sigmask = initSigmask
	...
	newm1(mp)
}
~~~

[`runtime.newm1`](https://draveness.me/golang/tree/runtime.newm1) 会调用特定平台的 [`runtime.newosproc`](https://draveness.me/golang/tree/runtime.newosproc) 通过系统调用 `clone` 创建一个新的线程并在新的线程中执行 [`runtime.mstart`](https://draveness.me/golang/tree/runtime.mstart)：

~~~go
func newosproc(mp *m) {
	stk := unsafe.Pointer(mp.g0.stack.hi)
	var oset sigset
	sigprocmask(_SIG_SETMASK, &sigset_all, &oset)
	ret := clone(cloneFlags, stk, unsafe.Pointer(mp), unsafe.Pointer(mp.g0), unsafe.Pointer(funcPC(mstart)))
	sigprocmask(_SIG_SETMASK, &oset, nil)
	...
}
~~~

在新创建的线程中，我们会执行存储在 [`runtime.m`](https://draveness.me/golang/tree/runtime.m) 中的 [`runtime.sysmon`](https://draveness.me/golang/tree/runtime.sysmon) 启动系统监控：

~~~go
func sysmon() {
	sched.nmsys++
	checkdead()

	lasttrace := int64(0)
	idle := 0
	delay := uint32(0)
	for {
		if idle == 0 {
			delay = 20
		} else if idle > 50 {
			delay *= 2
		}
		if delay > 10*1000 {
			delay = 10 * 1000
		}
		usleep(delay)
		...
	}
}
~~~

当运行时刚刚调用上述函数时，会先通过 [`runtime.checkdead`](https://draveness.me/golang/tree/runtime.checkdead) 检查是否存在死锁，然后进入核心的监控循环；系统监控在每次循环开始时都会通过 `usleep` 挂起当前线程，该函数的参数是微秒，运行时会遵循以下的规则决定休眠时间：

- 初始的休眠时间是 20μs；
- 最长的休眠时间是 10ms；
- 当系统监控在 50 个循环中都没有唤醒 Goroutine 时，休眠时间在每个循环都会倍增；

当程序趋于稳定之后，系统监控的触发时间就会稳定在 10ms。它除了会检查死锁之外，还会在循环中完成以下的工作：

- 运行计时器 — 获取下一个需要被触发的计时器；
- 轮询网络 — 获取需要处理的到期文件描述符；
- 抢占处理器 — 抢占运行时间较长的或者处于系统调用的 Goroutine；
- 垃圾回收 — 在满足条件时触发垃圾收集回收内存；

我们在这一节中会依次介绍系统监控是如何完成上述几种不同工作的。



## 检查死锁

系统监控通过 [`runtime.checkdead`](https://draveness.me/golang/tree/runtime.checkdead) 检查运行时是否发生了死锁，我们可以将检查死锁的过程分成以下三个步骤：

1. 检查是否存在正在运行的线程；
2. 检查是否存在正在运行的 Goroutine；
3. 检查处理器上是否存在计时器；

该函数首先会检查 Go 语言运行时中正在运行的线程数量，我们通过调度器中的多个字段计算该值的结果：

```go
func checkdead() {
	var run0 int32
	run := mcount() - sched.nmidle - sched.nmidlelocked - sched.nmsys
	if run > run0 {
		return
	}
	if run < 0 {
		print("runtime: checkdead: nmidle=", sched.nmidle, " nmidlelocked=", sched.nmidlelocked, " mcount=", mcount(), " nmsys=", sched.nmsys, "\n")
		throw("checkdead: inconsistent counts")
	}
	...
}
```

1. [`runtime.mcount`](https://draveness.me/golang/tree/runtime.mcount) 根据下一个待创建的线程 id 和释放的线程数得到系统中存在的线程数；
2. `nmidle` 是处于空闲状态的线程数量；
3. `nmidlelocked` 是处于锁定状态的线程数量；
4. `nmsys` 是处于系统调用的线程数量；

利用上述几个线程相关数据，我们可以得到正在运行的线程数，如果线程数量大于 0，说明当前程序不存在死锁；如果线程数小于 0，说明当前程序的状态不一致；如果线程数等于 0，我们需要进一步检查程序的运行状态：

```go
func checkdead() {
	...
	grunning := 0
	for i := 0; i < len(allgs); i++ {
		gp := allgs[i]
		if isSystemGoroutine(gp, false) {
			continue
		}
		s := readgstatus(gp)
		switch s &^ _Gscan {
		case _Gwaiting, _Gpreempted:
			grunning++
		case _Grunnable, _Grunning, _Gsyscall:
			print("runtime: checkdead: find g ", gp.goid, " in status ", s, "\n")
			throw("checkdead: runnable g")
		}
	}
	unlock(&allglock)
	if grunning == 0 {
		throw("no goroutines (main called runtime.Goexit) - deadlock!")
	}
	...
}
```

1. 当存在 Goroutine 处于 `_Grunnable`、`_Grunning` 和 `_Gsyscall` 状态时，意味着程序发生了死锁；
2. 当所有的 Goroutine 都处于 `_Gidle`、`_Gdead` 和 `_Gcopystack` 状态时，意味着主程序调用了 [`runtime.goexit`](https://draveness.me/golang/tree/runtime.goexit)；

当运行时存在等待的 Goroutine 并且不存在正在运行的 Goroutine 时，我们会检查处理器中存在的计时器[1](https://draveness.me/golang/docs/part3-runtime/ch06-concurrency/golang-sysmon/#fn:1)：

```go
func checkdead() {
	...
	for _, _p_ := range allp {
		if len(_p_.timers) > 0 {
			return
		}
	}

	throw("all goroutines are asleep - deadlock!")
}
```

如果处理器中存在等待的计时器，那么所有的 Goroutine 陷入休眠状态是合理的，不过如果不存在等待的计时器，运行时会直接报错并退出程序。







## 垃圾回收

在最后，系统监控还会决定是否需要触发强制垃圾回收，[`runtime.sysmon`](https://draveness.me/golang/tree/runtime.sysmon) 会构建 [`runtime.gcTrigger`](https://draveness.me/golang/tree/runtime.gcTrigger) 并调用 [`runtime.gcTrigger.test`](https://draveness.me/golang/tree/runtime.gcTrigger.test) 方法判断是否需要触发垃圾回收：

```go
func sysmon() {
	...
	for {
		...
		if t := (gcTrigger{kind: gcTriggerTime, now: now}); t.test() && atomic.Load(&forcegc.idle) != 0 {
			lock(&forcegc.lock)
			forcegc.idle = 0
			var list gList
			list.push(forcegc.g)
			injectglist(&list)
			unlock(&forcegc.lock)
		}
		...
	}
}
```

如果需要触发垃圾回收，我们会将用于垃圾回收的 Goroutine 加入全局队列，让调度器选择合适的处理器去执行。





# 总结

> 运行时通过系统监控来触发线程的抢占、网络的轮询和垃圾回收，保证 Go 语言运行时的可用性。系统监控能够很好地解决尾延迟的问题，减少调度器调度 Goroutine 的饥饿问题并保证计时器在尽可能准确的时间触发。