---
title: 面经
author: 菠萝
email: 2493381254@qq.com
readmore: true
hideTime: true
categories: 后端
tag: 面经
date: 2024-03-30 13:49:49
---

<a name="zHxrg"></a>

# 数组和切片

<a name="UY2el"></a>

## 1.数组和切片有什么不同

- slice 的底层数据是数组，slice 是对数组的封装，它描述一个数组的片段
- 数组是定长的，长度定义好之后，不能再更改。
- 数组就是一片连续的内存， slice 实际上是一个结构体，包含三个字段：长度、容量、底层数组。

```go
// runtime/slice.go
type slice struct {
    array unsafe.Pointer // 元素指针
    len   int // 长度 
    cap   int // 容量
}
```

<a name="A2w4w"></a>

## 2.切片的容量是怎么增长的

一般都是在向 slice 追加了元素之后，才会引起扩容。追加元素调用的是 append 函数。

> 使用 append 可以向 slice 追加元素，实际上是往底层数组添加元素。但是底层数组的长度是固定的，如果索引 len-1 所指向的元素已经是底层数组的最后一个元素，就没法再添加了。

> 这时，slice 会迁移到新的内存位置，新底层数组的长度也会增加，这样就可以放置新增的元素。同时，为了应对未来可能再次发生的 append 操作，新的底层数组的长度，也就是新 slice 的容量是留了一定的 buffer 的。否则，每次添加元素的时候，都会发生迁移，成本太高。

**新 slice 预留的 buffer 大小是有一定规律的。在golang1.18版本更新之前网上大多数的文章都是这样描述slice的扩容策略的：**

> 当原 slice 容量小于 1024 的时候，新 slice 容量变成原来的 2 倍；原 slice 容量超过 1024，新 slice 容量变成原来的1.25倍。

**在1.18版本更新之后，slice的扩容策略变为了：**

> 当原slice容量(oldcap)小于256的时候，新slice(newcap)容量为原来的2倍；原slice容量超过256，新slice容量newcap = oldcap+(oldcap+3*256)/4

- 最后newcap 要通过 **runupsize()**计算得到
- 这个runupsize（）就是内存对齐的策略 -- 为了避免内存碎片，最后会进行 内存对齐计算

runupsize() 进行内存对齐的计算
hello world

<a name="un0Jg"></a>

## 3.切片作为函数参数

前面我们说到，slice 其实是一个结构体，包含了三个成员：len, cap, array。分别表示切片长度，容量，底层数据的地址。
当 slice 作为函数参数时，就是一个普通的结构体。其实很好理解：若直接传 slice，在调用者看来，实参 slice 并不会被函数中的操作改变；若传的是 slice 的指针，在调用者看来，是会被改变原 slice 的。
值得注意的是，不管传的是 slice 还是 slice 指针，如果改变了 slice 底层数组的数据，会反应到实参 slice 的底层数据。为什么能改变底层数组的数据？很好理解：底层数据在 slice 结构体里是一个指针，尽管 slice 结构体自身不会被改变，也就是说底层数据地址不会被改变。 但是通过指向底层数据的指针，可以改变切片的底层数据，没有问题。

<a name="vmoca"></a>

## 4.指针在go中的作用？

1. **引用传递**
   - 在函数调用时，通过指针可以实现引用传递。这意味着当你将一个变量的地址作为参数传递给函数时，函数可以直接操作该变量的原始值，而非创建一个新的副本。这提高了效率，特别是在处理大数据结构（如数组、切片、结构体等）时，避免了不必要的内存拷贝，降低了开销。
2. **动态内存分配**
   - 使用内建的 new 函数或 make 函数（对于slice、map和channel这类复合类型），Go语言可以动态地在堆上分配内存，并返回指向新分配内存的指针。通过指针，我们可以方便地创建和管理生命周期不受函数范围约束的变量。
3. **修改函数外部变量**
   - Go函数默认是值传递的，但通过传递变量的指针，函数可以修改外部作用域内的变量值。这对于需要改变原始数据的函数设计至关重要。
4. **数据结构底层操作**
   - 在开发诸如链表、树、图等高级数据结构时，指针是构建这些结构的基础，因为它们依赖于节点间的引用关系。
5. **低级内存操作**
   - 尽管Go语言的设计理念倾向于抽象掉大部分底层细节，但在一些高级或系统级编程场景中，指针仍然可以用于直接操作内存地址，以满足特定的性能要求或与其他语言库进行交互。
6. **接口实现**
   - 在Go语言的接口类型中，虽然接口变量本身不包含指针，但是在实现接口时，结构体指针经常被用来实现方法集，这样可以避免方法接收者复制带来的额外开销，并且更容易满足接口的语义。

总之，Go语言中的指针极大地增强了程序设计的灵活性和效率，它是实现高性能和低延迟代码的关键工具之一，同时也要求开发者谨慎使用以避免潜在的悬挂指针、内存泄漏和其他因不当使用指针引起的错误。

<a name="UFeb5"></a>

# 谈谈go中比较相等

https://blog.csdn.net/qmhball/article/details/113771087

<a name="UPrWW"></a>

# 哈希表

<a name="LmCZi"></a>

## 1.map的实现原理

hmap 的结构
[]bmap  buckets：主要用来存储数据的
<a name="rtqrA"></a>

### 1.1 map的内存模型

> map 的设计也被称为 “The dictionary problem”，它的任务是设计一种数据结构用来维护一个集合的数据，并且可以同时对集合进行增删查改的操作。最主要的数据结构有两种：哈希查找表（Hash table）、搜索树（Search tree）。

哈希查找表用一个哈希函数将 key 分配到不同的桶（bucket，也就是数组的不同 index）。这样，开销主要在哈希函数的计算以及数组的常数访问时间。在很多场景下，哈希查找表的性能很高。

哈希查找表一般会存在“碰撞”的问题，就是说不同的 key 被哈希到了同一个 bucket。一般有两种应对方法：**链表法**和**开放地址法**。链表法将一个 bucket 实现成一个链表，落在同一个 bucket 中的 key 都会插入这个链表。开放地址法则是碰撞发生后，通过一定的规律，在数组的后面挑选“空位”，用来放置新的 key。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1707736365056-6aa32234-ad06-4cff-9e10-edbaf7f35e72.png#averageHue=%23fefdfb&clientId=u837611a0-3122-4&from=paste&height=520&id=ue80771bf&originHeight=650&originWidth=1043&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=97478&status=done&style=none&taskId=u583e6ba5-15a8-4edf-b439-003df3348bf&title=&width=834.4)

:::success
当 map 的 key 和 value 都不是指针，并且 size 都小于 128 字节的情况下，会把 bmap 标记为不含指针，这样可以避免 gc 时扫描整个 hmap。但是，我们看 bmap 其实有一个 overflow 的字段，是指针类型的，破坏了 bmap 不含指针的设想，这时会把 overflow 移动到 extra 字段来。
:::
<a name="aiGZU"></a>

### 1.2 创建map

从语法层面上来说，创建 map 很简单：

```go
ageMp := make(map[string]int)
// 指定 map 长度
ageMp := make(map[string]int, 8)

// ageMp 为 nil，不能向其添加元素，会直接panic
var ageMp map[string]int
```

> 通过汇编语言可以看到，实际上底层调用的是 **makemap **函数，主要做的工作就是初始化 hmap 结构体的各种字段，例如计算 B 的大小，设置哈希种子 hash0 等等。

**通过汇编语言可以看到，实际上底层调用的是 makemap 函数，主要做的工作就是初始化 hmap 结构体的各种字段，例如计算 B 的大小，设置哈希种子 hash0 等等。**

```go
func makemap(t *maptype, hint int64, h *hmap, bucket unsafe.Pointer) *hmap {
	// 省略各种条件检查...

	// 找到一个 B，使得 map 的装载因子在正常范围内
	B := uint8(0)
	for ; overLoadFactor(hint, B); B++ {
	}

	// 初始化 hash table
	// 如果 B 等于 0，那么 buckets 就会在赋值的时候再分配
	// 如果长度比较大，分配内存会花费长一点
	buckets := bucket
	var extra *mapextra
	if B != 0 {
		var nextOverflow *bmap
		buckets, nextOverflow = makeBucketArray(t, B)
		if nextOverflow != nil {
			extra = new(mapextra)
			extra.nextOverflow = nextOverflow
		}
	}

	// 初始化 hamp
	if h == nil {
		h = (*hmap)(newobject(t.hmap))
	}
	h.count = 0
	h.B = B
	h.extra = extra
	h.flags = 0
	h.hash0 = fastrand()
	h.buckets = buckets
	h.oldbuckets = nil
	h.nevacuate = 0
	h.noverflow = 0

	return h
}
```

【引申1】slice 和 map 分别作为函数参数时有什么区别？
注意，这个函数返回的结果：*hmap，它是一个指针，而我们之前讲过的 makeslice 函数返回的是 Slice 结构体：

| ```go
func makeslice(et *_type, len, cap int) slice

```
 |
| --- |

回顾一下 slice 的结构体定义：

| ```go
// runtime/slice.go
type slice struct {
    array unsafe.Pointer // 元素指针
    len   int // 长度 
    cap   int // 容量
}
```


|  |
| - |

结构体内部包含底层的数据指针。
makemap 和 makeslice 的区别，带来一个不同点：当 map 和 slice 作为函数参数时，在函数参数内部对 map 的操作会影响 map 自身；而对 slice 却不会（之前讲 slice 的文章里有讲过）。
**主要原因：一个是指针（*hmap），一个是结构体（slice）。Go 语言中的函数传参都是值传递，在函数内部，参数会被 copy 到本地。*hmap指针 copy 完之后，仍然指向同一个 map，因此函数内部对 map 的操作会影响实参。而 slice 被 copy 后，会成为一个新的 slice，对它进行的操作不会影响到实参。**

<a name="RUSSW"></a>

### 1.3 哈希函数

map 的一个关键点在于，哈希函数的选择。在程序启动时，会检测 cpu 是否支持 aes，如果支持，则使用 aes hash，否则使用 memhash。这是在函数 alginit() 中完成，位于路径：src/runtime/alg.go 下。

> hash 函数，有加密型和非加密型。 加密型的一般用于加密数据、数字摘要等，典型代表就是 md5、sha1、sha256、aes256 这种； 非加密型的一般就是查找。在 map 的应用场景中，用的是查找。 选择 hash 函数主要考察的是两点：性能、碰撞概率。

<a name="b8Y6Q"></a>

### 1.4 key 定位过程

key 经过哈希计算后得到哈希值，共 64 个 bit 位（64位机，32位机就不讨论了，现在主流都是64位机），计算它到底要落在哪个桶时，只会用到最后 B 个 bit 位。还记得前面提到过的 B 吗？如果 B = 5，那么桶的数量，也就是 buckets 数组的长度是 2^5 = 32。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1711342431556-0338b0ec-2976-4d33-a6bc-810de5584725.png#averageHue=%23f8f1e1&clientId=u5abd9b27-d228-4&from=paste&height=962&id=u965f75cc&originHeight=1203&originWidth=945&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=112839&status=done&style=none&taskId=u69ca3392-788a-4fb5-9848-f5e6ed45b4d&title=&width=756)

<a name="pmAak"></a>

## 2.扩容过程

好的！
对于map的扩容
触发条件：

1. 超过了负载因子的大小 6.5 那么一般会发生扩容   双倍扩容
2. 当overflow的buckets数量过多的时候，会发生扩容  等量扩容

主要是申请到了新的 buckets 空间，把相关的标志位都进行了处理：例如标志 nevacuate 被置为 0， 表示当前搬迁进度为 0。

<a name="q6H8R"></a>

## 3.key为什么是无序的

map 在扩容后，会发生 key 的搬迁，原来落在同一个 bucket 中的 key，搬迁后，有些 key 就要远走高飞了（bucket 序号加上了 2^B）。而遍历的过程，就是按顺序遍历 bucket，同时按顺序遍历 bucket 中的 key。搬迁后，key 的位置发生了重大的变化，有些 key 飞上高枝，有些 key 则原地不动。这样，遍历 map 的结果就不可能按原来的顺序了。
当然，如果我就一个 hard code 的 map，我也不会向 map 进行插入删除的操作，按理说每次遍历这样的 map 都会返回一个固定顺序的 key/value 序列吧。的确是这样，但是 Go 杜绝了这种做法，因为这样会给新手程序员带来误解，以为这是一定会发生的事情，在某些情况下，可能会酿成大错。
当然，Go 做得更绝，当我们在遍历 map 时，并不是固定地从 0 号 bucket 开始遍历，每次都是从一个随机值序号的 bucket 开始遍历，并且是从这个 bucket 的一个随机序号的 cell 开始遍历。这样，即使你是一个写死的 map，仅仅只是遍历它，也不太可能会返回一个固定序列的 key/value 对了。
多说一句，“迭代 map 的结果是无序的”这个特性是从 go 1.0 开始加入的。

<a name="PEoOn"></a>

## 4.float类型可以作为map的key吗？

> **最后说结论：float 型可以作为 key，但是由于精度的问题，会导致一些诡异的问题，慎用之。**

由于 NAN 的特性：

| ```go
NAN != NAN
hash(NAN) != hash(NAN)

```
 |
| --- |

因此向 map 中查找的 key 为 NAN 时，什么也查不到；如果向其中增加了 4 次 NAN，遍历会得到 4 个 NAN。
最后说结论：float 型可以作为 key，但是由于精度的问题，会导致一些诡异的问题，慎用之。



<a name="mYheS"></a>
## 5.如何比较2个map是否相等
map 深度相等的条件：
​```shell
1、都为 nil
2、非空、长度相等，指向同一个 map 实体对象
3、相应的 key 指向的 value “深度”相等
```

直接将使用 map1 == map2 是错误的。这种写法只能比较 map 是否为 nil。

```go
package main

import "fmt"

func main() {
    var m map[string]int
    var n map[string]int

    fmt.Println(m == nil)
    fmt.Println(n == nil)

    // 不能通过编译
    //fmt.Println(m == n)
}
```

输出结果：

```
true
true
```

因此只能是遍历map 的每个元素，比较元素是否都是深度相等。

<a name="ctd0k"></a>

## 6.map是线程安全的吗？

map 不是线程安全的。
在查找、赋值、遍历、删除的过程中都会检测写标志，一旦发现写标志置位（等于1），则直接 panic。赋值和删除函数在检测完写标志是复位之后，先将写标志位置位，才会进行之后的操作。
检测写标志：

```go
if h.flags&hashWriting == 0 {
    throw("concurrent map writes")
}
```

设置写标志：

```go
h.flags |= hashWriting
```

<a name="ehnu5"></a>

# 接口

<a name="JXtlw"></a>

## 1.值接收者和指针接收者的区别

> 方法能给用户自定义的类型添加新的行为。它和函数的区别在于方法有一个接收者，给一个函数添加一个接收者，那么它就变成了方法。接收者可以是值接收者，也可以是指针接收者。
> 在调用方法的时候，值类型既可以调用值接收者的方法，也可以调用指针接收者的方法；指针类型既可以调用指针接收者的方法，也可以调用值接收者的方法。
> 也就是说，不管方法的接收者是什么类型，该类型的值和指针都可以调用，不必严格符合接收者的类型。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708063414631-c6a82c2b-95c9-473e-81fa-6a9946eeee84.png#averageHue=%23efeff0&clientId=u10e25113-1fbf-4&from=paste&height=254&id=u5ca141e4&originHeight=317&originWidth=887&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=48073&status=done&style=none&taskId=ubfe9f830-15bf-4102-9516-bdbdf7aaf51&title=&width=709.6)

前面说过，不管接收者类型是值类型还是指针类型，都可以通过值类型或指针类型调用，这里面实际上通过语法糖起作用的。
先说结论：**实现了接收者是值类型的方法，相当于自动实现了接收者是指针类型的方法；而实现了接收者是指针类型的方法，不会自动生成对应接收者是值类型的方法。**

> 如果实现了接收者是值类型的方法，会隐含地也实现了接收者是指针类型的方法。

<a name="QdfRY"></a>

### 两者分别在何时使用

如果方法的接收者是值类型，无论调用者是对象还是对象指针，修改的都是对象的副本，不影响调用者；如果方法的接收者是指针类型，则调用者修改的是指针指向的对象本身。
使用指针作为方法的接收者的理由：

- 方法能够修改接收者指向的值。
- 避免在每次调用方法时复制该值，在值的类型为大型结构体时，这样做会更加高效。

是使用值接收者还是指针接收者，不是由该方法是否修改了调用者（也就是接收者）来决定，而是应该基于该类型的本质。
如果类型具备“原始的本质”，也就是说它的成员都是由 Go 语言里内置的原始类型，如字符串，整型值等，那就定义值接收者类型的方法。像内置的引用类型，如 slice，map，interface，channel，这些类型比较特殊，声明他们的时候，实际上是创建了一个 header， 对于他们也是直接定义值接收者类型的方法。这样，调用函数时，是直接 copy 了这些类型的 header，而 header 本身就是为复制设计的。
如果类型具备非原始的本质，不能被安全地复制，这种类型总是应该被共享，那就定义指针接收者的方法。比如 go 源码里的文件结构体（struct File）就不应该被复制，应该只有一份实体。

<a name="In8Nr"></a>

## 接口的实现 iface 和 eface 以及 itab

iface {
itab
data
}

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710212824390-a14f5dcf-ebff-4508-84a8-881bc37fc2d8.png#averageHue=%23fdfbf8&clientId=u3862322c-e6d6-4&from=paste&height=792&id=u4e0483e5&originHeight=792&originWidth=772&originalType=binary&ratio=1&rotation=0&showTitle=false&size=81952&status=done&style=none&taskId=ufe919460-e463-43ab-b13e-f23fb2d999d&title=&width=772)

eface {
type
data
}
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710212849543-693776d9-3129-4f58-bdd5-509bb089b27b.png#averageHue=%23fcf7ed&clientId=u3862322c-e6d6-4&from=paste&height=369&id=ucd7955a5&originHeight=369&originWidth=869&originalType=binary&ratio=1&rotation=0&showTitle=false&size=23540&status=done&style=none&taskId=ufea197ce-d6c3-4618-872b-a5a7f02ff45&title=&width=869)

接口的动态类型和动态值：
动态类型：itab
动态值：data

_类型转换_、_类型断言_本质都是把一个类型转换成另外一个类型。不同之处在于，类型断言是对接口变量进行的操作。

接口转换的原理：
当判定一种类型是否满足某个接口时，Go 使用类型的方法集和接口所需要的方法集进行匹配，如果类型的方法集完全包含接口的方法集，则可认为该类型实现了该接口。

1. 具体类型转空接口时，_type 字段直接复制源类型的 _type；调用 mallocgc 获得一块新内存，把值复制进去，data 再指向这块新内存。
2. 具体类型转非空接口时，入参 tab 是编译器在编译阶段预先生成好的，新接口 tab 字段直接指向入参 tab 指向的 itab；调用 mallocgc 获得一块新内存，把值复制进去，data 再指向这块新内存。
3. 而对于接口转接口，itab 调用 getitab 函数获取。只用生成一次，之后直接从 hash 表中获取。

<a name="P7rSP"></a>

# 谈一谈GO 的GPM模型

好的。
G: groutine  ----- 协程
P: proceccor  ----  保存了一个可以运行的G的队列
M: machine ----- os 中的 线程

每个p的话，它会绑定M才能去执行G

M执行调度G的任务

M再空闲的时候，可能会去全局的G的队列中获取可以处于GRungable的G来运行
同时，如果全局的队列中没有G了，我们可以去其他M绑定的P的LRQ中去抢G来运行

<a name="lwMcK"></a>

### 聊一聊协程和线程的区别

好的
从几个方面：

1. 内存消耗
2. 创建和销毁
3. 切换

内存占用的话：
一个goroutine一般是分配2KB的内存消耗
一个线程的话一般是分配1MB的内存

创建和销毁
threaad的创建和销毁都比计较繁琐，由于线程是操作系统级别的
他的创建和销毁会于os kernel 进行交互

调度
goroutine 是由goruntime来进行管理的，相当于他是用户级别的概念
创建和销毁有goruntime来进行，不需要于内核进行交互。更快

切换

<a name="kL8g6"></a>

# 垃圾回收器

目前的垃圾回收器采用的垃圾回收方式基本是2大类

1. 追踪式-- 标记清除 标记整理  增量式 增量整理
2. 引用计数
3. 分代

目前go采用的式追踪式的垃圾回收方式
标记类的回收
**三色标记法**
三种颜色的对象
**黑色对象**
**灰色对象**
白色对象
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1711518789349-d1cce1d6-28e2-4743-b6d0-4a1fae5a6ede.png#averageHue=%23f3f4f4&clientId=uc4b3b2b3-ab6a-4&from=paste&height=431&id=u572bd87a&originHeight=539&originWidth=885&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=63363&status=done&style=none&taskId=ud22fa045-4d41-4c80-ac3d-20a63c2ca1a&title=&width=708)
在1.8的时候提出了混合屏障技术
Go 语言的垃圾回收（GC）过程可以概括为以下几个关键步骤，尽管实际实现包含了许多复杂的优化和技术细节：

1. **初始标记（Initial Marking）**:
   - GC 开始时，首先进行根扫描，标记所有活跃的“根对象”。根对象包括**全局变量**、**栈上的局部变量**、goroutine 的上下文以及其他一些内部数据结构引用的对象。
2. **并发标记（Concurrent Marking）**:
   - Go 语言的 GC 使用并发标记算法来减少停顿时间。在这个阶段，程序继续执行，同时垃圾回收器并发地追踪从根对象开始的所有可达对象，并标记它们为“存活”。
3. **标记终止（Stop-The-World Mark Termination）**:
   - 为了保证一致性，GC 必须在某一时刻暂停所有的 goroutine，进行所谓的“STW”（Stop-The-World）阶段，完成剩余的标记工作，**解决可能存在的并发标记期间产生的数据竞争问题**。
4. **标记整理（Mark & Sweep or Mark & Compact）**:
   - 标记完成后，进入清除阶段。在传统的标记-清除（Mark-and-Sweep）算法中，未被标记的对象被视为垃圾并回收它们占用的内存。
   - 在某些 Go 版本中，为了减少内存碎片，采用了标记-压缩（Mark-and-Compact）策略，移动所有存活对象到连续的空间，使得内存更加紧凑。
5. **写屏障（Write Barrier）**:
   - 在并发标记阶段，为了保持标记集合的一致性，Go 的 GC 引入了写屏障技术。当程序在并发标记期间修改对象引用时，写屏障会记录这种变化，以便后续处理。
6. **内存分配与清扫（Allocation & Sweeping）**:
   - 清理阶段之后，GC 会重新组织内存区域，使其能够用于新的分配。清理阶段也可能在并发模式下进行，部分区域在不阻塞程序执行的情况下完成清扫。
7. **增量清扫与并发清扫（Incremental Sweeping / Concurrent Sweeping）**:
   - 为了进一步减少 STW 时间，Go 的 GC 可能采用增量清扫策略，分散清扫过程在整个程序执行过程中进行。
8. **自适应调整（Adaptive Tuning）**:

<a name="UMix3"></a>

# 聊一聊你对go的context的理解

context式在go1.7中加入的
context被叫做上下文，包含Ggroutine的运行状态，环境，现场信息等。
context可以存储一些变量。可以用来goroutine之间通知退出和元数据传递的功能。

context 用来 goroutine 之间传递上下文信息，包括：取消信号、超时信号，截止时间，k-v等。

context
WithCancle()
WithDeadline()
WithTimeout()
WithValue()

Context: 定义了Context接口的四个方法
emptyCtx：空context
cancleCtx：可以取消的
timerCtx：定时context
valueCtx：存储的context
todoCtx：不知道干嘛的时候，后面可能需要传递参数，暂时不知道要干嘛的时候可以使用，用来标志。
cancler： 取消的接口

<a name="plu0f"></a>

# 聊一聊反射

> 在计算机科学中，反射是指计算机程序在运行时（Run time）可以访问、检测和修改它本身状态或行为的一种能力。用比喻来说，反射就是程序在运行的时候能够“观察”并且修改自己的行为。

**在计算机中，反射是指在计算机程序运行过程中，能够访问，检测和修改程程序本身状态或行为的一种能力。**

```go
package main

import (
    "fmt"
    "reflect"
)



type Dog struct {}

func (*Dog) HelloDog(){
    fmt.Println("hello dog")
}


func main (){
    var dog = Dog{}
    fdog := reflect.ValueOf(&dog)
    helloDog := fdog.MethodByName("HelloDog")

    helloDog.Call(nil)
}
```

使用反射的常见场景有以下两种：

1. 不能明确接口调用哪个函数，需要根据传入的参数在运行时决定。
2. 不能明确传入函数的参数类型，需要在运行时处理任意对象。

<a name="eY02K"></a>

# 聊一聊go中make和new

’
首先我们知道变量的初始化分为2个过程

1. 变量的声明
2. 分配内存空间

声明指类型变量的时候，系统会默认给他们分配内存空间，并且赋值该类型的零值。

new 和 make 都是内置函数
他们都是用来给变量分配内存空间的。

**使用场景区别：**
make 一般都是使用 slice map channel 这三种
new 的话可以分配任意类型的数据，并赋值0值
**返回值区别：**
make 函数返回的是 slice map channel 类型本身
new 返回的是内存地址的指针

<a name="i6gde"></a>

# 聊一聊TCMalloc

[https://zhuanlan.zhihu.com/p/29216091](https://zhuanlan.zhihu.com/p/29216091)

说一下微对象，小对象，大对象
0，16B
16，32KB
32KB
span

mcache  线程的内存管理
mcentral  中央内存管理
mheap  堆内存管理

<a name="QCD9H"></a>

# go语言里面的空结构体用来做什么

struct{}不占据任何内存空间
一般有三个用途：

1. 实现set集合
2. 和channel配合使用，不具备任何意义，但除用作goroutine之间通知
3. 实现一个不带字段，仅包含方法的结构体

<a name="rGBpk"></a>

# redis

<a name="nxOeH"></a>

## redis 如何实现好友功能

总体思路我们采用redis里面的zset完成整个功能, 原因是zset有排序(我们要按照关注时间的倒序排列), 去重(我们不能多次关注同一用户)功能. 一个用户我们存贮两个集合, 一个是保存用户关注的人 另一个是保存关注用户的人.
用到的命令是:
1、 zadd 添加成员：命令格式:zadd key score member [[score][member] …]
2、zrem 移除某个成员：命令格式:zrem key member [member …]
3、 zcard 统计集合内的成员数：命令格式:zcard key
4、 zrange 查询集合内的成员：命令格式:ZRANGE key start stop [WITHSCORES]
描述：返回指定区间的成员。其中成员位置按 score 值递增(从小到大)来排序。 WITHSCORES选项是用来让成员和它的score值一并返回.
5、 zrevrange跟zrange作用相反
6、zrank获取成员的排名：命令格式：zrank key member
描述：返回有序集key中成员member的排名。成员按 score 值递增(从小到大)顺序排列。排名以0开始，也就是说score 值最小的为0。返回值：返回成员排名，member不存在返回nil.
7、 zinterstore 取两个集合的交集：命令格式：ZINTERSTORE destination numkeys key [key …][WEIGHTS weight [weight …]] [AGGREGATE SUM|MIN|MAX]
描述：计算给定的一个或多个有序集的交集。其中给定 key 的数量必须以 numkeys 参数指定，并将该交集(结果集)储存到 destination 。默认情况下，结果集中某个成员的 score 值是所有给定集下该成员 score 值之 和 。
返回值：保存到 destination 的结果集成员数。
在Go语言中，我们可以使用Redigo库与Redis进行交互来实现好友功能，例如关注/取关、获取关注列表和共同关注等功能。以下是一个简单的示例框架，展示如何使用Redis的集合（Set）结构来存储和查询用户的关注关系：

```go
package main

import (
	"fmt"
	"github.com/gomodule/redigo/redis"
)

// Redis连接
var pool = &redis.Pool{
	Dial: func() (redis.Conn, error) {
		return redis.Dial("tcp", "localhost:6379")
	},
}

// 添加关注关系，将粉丝添加到博主的关注者集合中
func follow(followerId string, followedId string) error {
	conn := pool.Get()
	defer conn.Close()

	// 将followerId添加到followedId的关注集合中
	_, err := conn.Do("SADD", fmt.Sprintf("followers:%s", followedId), followerId)
	if err != nil {
		return err
	}

	// 反向添加，也将followedId添加到followerId的关注对象集合中
	_, err = conn.Do("SADD", fmt.Sprintf("following:%s", followerId), followedId)
	if err != nil {
		return err
	}

	return nil
}

// 取消关注关系
func unfollow(followerId string, followedId string) error {
	conn := pool.Get()
	defer conn.Close()

	// 从followedId的关注集合中移除followerId
	_, err := conn.Do("SREM", fmt.Sprintf("followers:%s", followedId), followerId)
	if err != nil {
		return err
	}

	// 从followerId的关注对象集合中移除followedId
	_, err = conn.Do("SREM", fmt.Sprintf("following:%s", followerId), followedId)
	if err != nil {
		return err
	}

	return nil
}

// 获取用户的关注列表
func getFollowing(userId string) ([]string, error) {
	conn := pool.Get()
	defer conn.Close()

	followingList, err := redis.Strings(conn.Do("SMEMBERS", fmt.Sprintf("following:%s", userId)))
	if err != nil {
		return nil, err
	}

	return followingList, nil
}

// 获取用户的粉丝列表
func getFollowers(userId string) ([]string, error) {
	conn := pool.Get()
	defer conn.Close()

	followerList, err := redis.Strings(conn.Do("SMEMBERS", fmt.Sprintf("followers:%s", userId)))
	if err != nil {
		return nil, err
	}

	return followerList, nil
}

// 获取两个用户之间的共同关注
func getCommonFollowings(userId1 string, userId2 string) ([]string, error) {
	conn := pool.Get()
	defer conn.Close()

	commonFollowingKeys := []interface{}{fmt.Sprintf("following:%s", userId1), fmt.Sprintf("following:%s", userId2)}
	intersection, err := redis.Strings(conn.Do("SINTER", commonFollowingKeys...))
	if err != nil {
		return nil, err
	}

	return intersection, nil
}

func main() {
	// 示例调用
	err := follow("userA", "userB")
	if err != nil {
		panic(err)
	}

	// 获取共同关注
	common, err := getCommonFollowings("userA", "userC")
	if err != nil {
		panic(err)
	}
	fmt.Println("Common followers:", common)
}

```

数据库的设计
好友功能的记录在开发社交应用时通常是要放入数据库进行存储的，以便于管理和维护用户间的好友关系。在设计数据库时，可以采用不同的策略来存储好友关系数据：
一对一冗余存储：为每个用户创建一个字段来存储其所有好友的ID列表。这种方法直观简单，但在处理大量好友关系时会导致数据冗余和更新困难。
一对多关联表：创建一个中间关联表（Friendship表或Relationship表），包含两个字段分别对应用户ID（如UserID, FriendID），这样每对好友之间存在一条记录。这种方式消除了数据冗余，并且易于添加、删除好友关系以及查询用户的社交网络。
例如，在SQL中，中间关联表的设计可能如下所示：

```sql
CREATE TABLE Friendship (
  UserID INT NOT NULL,
  FriendID INT NOT NULL,
  -- 其他可选字段，比如添加时间、好友备注等
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Nickname VARCHAR(50),
  PRIMARY KEY (UserID, FriendID),
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (FriendID) REFERENCES Users(UserID)
);

```

<a name="GKrQr"></a>

## redis的持久化

**aof：**操作日志。以追加写的方式
**rdb：**快照机制，记录所有键值对的快照。
**混合模式：**aof和rdb两种一起使用。

<a name="nNiZQ"></a>

## redis 缓存

<a name="NTqIP"></a>

### 什么是缓存雪崩，击穿，穿透

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708617628883-11a7fa2c-7443-4fb2-9a5c-dcc2aebb287f.png#averageHue=%23ede1be&clientId=u4cfdbc89-b6bf-4&from=paste&id=u49787c08&originHeight=622&originWidth=1080&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u3e228634-43dc-48fe-b051-f41730f7c4b&title=)

<a name="DM2UM"></a>

### 数据库和缓存如何保证一致性

「先更新数据库，再删除缓存」的方案虽然保证了数据库与缓存的数据一致性，但是每次更新数据的时候，缓存的数据都会被删除，这样会对缓存的命中率带来影响。
所以，**如果我们的业务对缓存命中率有很高的要求，我们可以采用「更新数据库 + 更新缓存」的方案，因为更新缓存并不会出现缓存未命中的情况**。
但是这个方案前面我们也分析过，在两个更新请求并发执行的时候，会出现数据不一致的问题，因为更新数据库和更新缓存这两个操作是独立的，而我们又没有对操作做任何并发控制，那么当两个线程并发更新它们的话，就会因为写入顺序的不同造成数据的不一致。
所以我们得增加一些手段来解决这个问题，这里提供两种做法：

- 在更新缓存前先加个**分布式锁**，保证同一时间只运行一个请求更新缓存，就会不会产生并发问题了，当然引入了锁后，对于写入的性能就会带来影响。
- 在更新完缓存时，给缓存加上较短的**过期时间**，这样即时出现缓存不一致的情况，缓存的数据也会很快过期，对业务还是能接受的。

对了，针对「先删除缓存，再更新数据库」方案在「读 + 写」并发请求而造成缓存不一致的解决办法是「**延迟双删**」。
延迟双删实现的伪代码如下：

```
#删除缓存
redis.delKey(X)
#更新数据库
db.update(X)
#睡眠
Thread.sleep(N)
#再删除缓存
redis.delKey(X)
```

加了个睡眠时间，主要是为了确保请求 A 在睡眠的时候，请求 B 能够在这这一段时间完成「从数据库读取数据，再把缺失的缓存写入缓存」的操作，然后请求 A 睡眠完，再删除缓存。
所以，请求 A 的睡眠时间就需要大于请求 B 「从数据库读取数据 + 写入缓存」的时间。
但是具体睡眠多久其实是个**玄学**，很难评估出来，所以这个方案也只是**尽可能**保证一致性而已，极端情况下，依然也会出现缓存不一致的现象。
因此，还是比较建议用「先更新数据库，再删除缓存」的方案。

<a name="AYHnC"></a>

#### 如何保证 2个操作都能执行成功？

问题原因知道了，该怎么解决呢？有两种方法：

- 重试机制。
- 订阅 MySQL binlog，再操作缓存。

<a name="OKDe4"></a>

## redis的线程模型

**IO多路复用**
redis的主要工作线程是单线程。
IO多路复用
edis 6.0 版本之前的单线模式如下图：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710157697915-c135cd77-807e-4b94-b99d-0924e0dc7c85.png#averageHue=%2398cc8a&clientId=u7be26187-811a-4&from=paste&id=u0fe88596&originHeight=1547&originWidth=1622&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u18a0cef3-7f1a-4224-a972-050ccb04ca9&title=)
首先在Redis初始化的时候，会做以下几件事

- 首先，调用epoll_create()创建一个epoll 对象和调用 socket() 创建一个服务端 socket
- 然后，调用bind() 绑定端口和调用 listen() 监听该 socket
- 然后，将调用epoll_ctl（） 将 listen socket 加入到epoll，同时注册 【连接事件】处理函数

初始化完成后呢？就会进入到一个 事件循环函数，主要会做以下事情：

- 首先，先调用**处理发送队列函数**，看是发送队列里是否有任务，如果有发送任务，则通过 write 函数将客户端发送缓存区里的数据发送出去，如果这一轮数据没有发送完，就会注册写事件处理函数，等待 epoll_wait 发现可写后再处理 。
- 接着，调用 epoll_wait 函数等待事件的到来
  - 如果是**连接事件**到来，则会调用**连接事件处理函数**，该函数会做这些事情：调用 accpet 获取已连接的 socket -> 调用 epoll_ctl 将已连接的 socket 加入到 epoll -> 注册「读事件」处理函数；
  - 如果是**读事件**到来，则会调用**读事件处理函数**，该函数会做这些事情：调用 read 获取客户端发送的数据 -> 解析命令 -> 处理命令 -> **将客户端对象添加到发送队列 **-> **将执行结果写到发送缓存区等待发送**；
  - 如果是**写事件**到来，则会调用**写事件处理函数**，该函数会做这些事情：通过 write 函数将客户端发送缓存区里的数据发送出去，如果这一轮数据没有发送完，就会继续注册写事件处理函数，等待 epoll_wait 发现可写后再处理 。

<a name="gWFAx"></a>

## Redis 采用单线程为什么还那么快？

1. Redis的大部分操作都在内存中完成，并且采用了高校的数据结构，因此，Redis瓶颈可能是机器的内存或者网络带宽，而并非CPU，既然CPU不是性能瓶颈，那么自然就采用单线程的解决方案了；
2. Redis采用单线程模型可以避免多线程之间的竞争，省去了多线程切换带来的时间和性能上的开销，而且也不会导致死锁的问题。
3. Redis采用了I/O多路复用机制处理大量的客户端 Socket请求，IO多路复用机制是指一个线程出路多个IO流，就是我们经常听到的select/epoll机制，在Redis只运行单线程的情况下，该机制允许内核中，同时存在多个监听Socket和已连接的Socket。内核会一只监听这些Socket上的连接请求或数据请求，一旦有请求打倒，就会交给Redis线程处理，这就实现了一个Redis线程处理多个IO流的效果。'
4. 丰富的数据结构。
5. 渐进式的ReHash，缓存时间戳设计

<a name="ICDHt"></a>

## Redis 6.0之后为什么引入了多线程？

虽然 Redis 的主要工作（网络 I/O 和执行命令）一直是单线程模型，但是**在 Redis 6.0 版本之后，也采用了多个 I/O 线程来处理网络请求**，**这是因为随着网络硬件的性能提升，Redis 的性能瓶颈有时会出现在网络 I/O 的处理上**。
所以为了提高网络 I/O 的并行度，Redis 6.0 对于网络 I/O 采用多线程来处理。**但是对于命令的执行，Redis 仍然使用单线程来处理，所以大家不要误解** Redis 有多线程同时执行命令。

因此， Redis 6.0 版本之后，Redis 在启动的时候，默认情况下会**额外创建 6 个线程**（_这里的线程数不包括主线程_）：

- Redis-server ： Redis的主线程，主要负责执行命令；
- bio_close_file、bio_aof_fsync、bio_lazy_free：三个后台线程，分别异步处理关闭文件任务、AOF刷盘任务、释放内存任务；
- io_thd_1、io_thd_2、io_thd_3：三个 I/O 线程，io-threads 默认是 4 ，所以会启动 3（4-1）个 I/O 多线程，用来分担 Redis 网络 I/O 的压力。

<a name="gEyxn"></a>

## redis的持久化是如何实现的？

aof日志 和 rdb快照

<a name="FiNyQ"></a>

## redis的集群模式模式

想要设计一个高可用的Redis服务，一定要从Redis的多服务借点来考虑：

1. 主从复制
2. 哨兵模式
3. 切片模式

<a name="VvF61"></a>

### **主从的实现：**

采用一主多从的模式，且主从服务器之间采用的时【读写分离】的方式
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709816765570-9c2881ee-bfcc-4684-9a2a-d33c343d0098.png#averageHue=%23faf9f8&clientId=u8d88e84c-6e84-4&from=paste&height=482&id=ua6a64fdd&originHeight=482&originWidth=1109&originalType=binary&ratio=1&rotation=0&showTitle=false&size=114114&status=done&style=none&taskId=ueae1b274-64a0-4ded-ab07-35bd8b759b8&title=&width=1109)

主从服务器间的第一次同步的过程可分为三个阶段：

- **第一阶段是建立链接、协商同步**；
- **第二阶段是主服务器同步数据给从服务器；**
- **第三阶段是主服务器发送新写操作命令给从服务器。**

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710907449732-30a8b8f8-4643-40b4-8375-807f2a25605c.png#averageHue=%23f7f0e7&clientId=u54fe126c-6b6a-4&from=paste&id=ub658da5c&originHeight=555&originWidth=1080&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua064b7b0-698c-4667-ae49-f81aaf22912&title=)

主从复制共有三种模式：**全量复制、基于长连接的命令传播、增量复制**。
主从服务器第一次同步的时候，就是采用**全量复制**，此时主服务器会两个耗时的地方，分别是生成 RDB 文件和传输 RDB 文件。为了避免过多的从服务器和主服务器进行全量复制，可以把一部分从服务器升级为「经理角色」，让它也有自己的从服务器，通过这样可以分摊主服务器的压力。
**第一次同步完成后，主从服务器都会维护着一个长连接**，主服务器在接收到写操作命令后，就会通过这个连接将写命令传播给从服务器，来保证主从服务器的数据一致性。
**如果遇到网络断开，增量复制就可以上场了**，不过这个还跟 repl_backlog_size 这个大小有关系。
如果它配置的过小，主从服务器网络恢复时，可能发生「从服务器」想读的数据已经被覆盖了，那么这时就会导致主服务器采用全量复制的方式。所以为了避免这种情况的频繁发生，要调大这个参数的值，以降低主从服务器断开后全量同步的概率。

replication buffer 、repl backlog buffer 区别如下：

- 出现的阶段不一样：
  - repl backlog buffer 是在增量复制阶段出现，**一个主节点只分配一个 repl backlog buffer**；
  - replication buffer 是在全量复制阶段和增量复制阶段都会出现，**主节点会给每个新连接的从节点，分配一个 replication buffer**；
- 这两个 Buffer 都有大小限制的，当缓冲区满了之后，发生的事情不一样：
  - 当 repl backlog buffer 满了，因为是环形结构，会直接**覆盖起始位置数据**;
  - 当 replication buffer 满了，会导致连接断开，删除缓存，从节点重新连接，**重新开始全量复制**。

<a name="ot4WQ"></a>

### **哨兵模式**

[https://xiaolincoding.com/redis/cluster/sentinel.html#%E7%94%B1%E5%93%AA%E4%B8%AA%E5%93%A8%E5%85%B5%E8%BF%9B%E8%A1%8C%E4%B8%BB%E4%BB%8E%E6%95%85%E9%9A%9C%E8%BD%AC%E7%A7%BB](https://xiaolincoding.com/redis/cluster/sentinel.html#%E7%94%B1%E5%93%AA%E4%B8%AA%E5%93%A8%E5%85%B5%E8%BF%9B%E8%A1%8C%E4%B8%BB%E4%BB%8E%E6%95%85%E9%9A%9C%E8%BD%AC%E7%A7%BB)
由于主从模式会出现，再主从服务器出现宕机的时候，需要手动进行恢复，出现了哨兵模式。

Redis Sentinel
哨兵模式可与监控主从服务器，并提供主从结点故障转移的功能。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709816941354-44b782c7-f857-4bd3-8506-29e878e02fe9.png#averageHue=%23f7f6f4&clientId=u8d88e84c-6e84-4&from=paste&height=501&id=u3a3dfeb9&originHeight=501&originWidth=1019&originalType=binary&ratio=1&rotation=0&showTitle=false&size=119351&status=done&style=none&taskId=u40dc025e-26c5-42ed-8e72-39f3f06d03c&title=&width=1019)

**哨兵机制是基于发布订阅来实现的。**
哨兵其实是一个运行在特殊模式下的 Redis 进程，所以它也是一个节点。从“哨兵”这个名字也可以看得出来，它相当于是“观察者节点”，观察的对象是主从节点。
当然，它不仅仅是观察那么简单，在它观察到有异常的状况下，会做出一些“动作”，来修复异常状态。
哨兵节点主要负责三件事情：**监控、选主、通知**。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710907699863-78577840-b9bf-438c-a10b-593c5451e9df.png#averageHue=%23fdf9f5&clientId=u54fe126c-6b6a-4&from=paste&id=u2647a445&originHeight=326&originWidth=912&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ufe41a467-15b6-466c-a63c-9620020f875&title=)

<a name="stJCL"></a>

### **切片模式**

当Redis缓存数据量大到一台服务器无法缓存时，就需要使用Redis切片集群（Redis Cluster）方案。

Redis Cluster方案采用哈希槽（Hash Slot），来处理数据结点之间的映射关系。
再Redis Cluster方案中，一个切片集群有16384个哈希槽。每个键值对，会根据他的key，被映射到一个哈希槽中，具体步骤：

- 更具键值对的Key，按照CRC16算法，计算一个16bit的值
- 在对16bit的值取模，得到 0~16383 范围内的模数，每个模数代表一个相应编号的哈希槽。

接下来的问题就是，这些哈希槽怎么被映射到具体的 Redis 节点上的呢？有两种方案：

- **平均分配：** 在使用 cluster create 命令创建 Redis 集群时，Redis 会自动把所有哈希槽平均分布到集群节点上。比如集群中有 9 个节点，则每个节点上槽的个数为 16384/9 个。
- **手动分配：** 可以使用 cluster meet 命令手动建立节点间的连接，组成集群，再使用 cluster addslots 命令，指定每个节点上的哈希槽个数。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709817224814-634accf4-59bc-4e83-8870-86804c99a703.png#averageHue=%23dfd8ca&clientId=u8d88e84c-6e84-4&from=paste&height=535&id=u1985e345&originHeight=535&originWidth=1149&originalType=binary&ratio=1&rotation=0&showTitle=false&size=132239&status=done&style=none&taskId=ube9fa897-be9f-484b-9d8b-97ffe79018b&title=&width=1149)

<a name="cIlzQ"></a>

## 集群脑裂导致数据丢失怎么办？

脑裂：由于网络问题，集群节点之间失去联系。主从数据不同步；重新平衡选举，产生两个主服务。

解决方案：
当主节点发现从节点下线或者通信超时的总数量小于阈值时，那么禁止主节点进行写数据，直接把错误返回给客户端。
在 Redis 的配置文件中有两个参数我们可以设置：

- min-slaves-to-write x，主节点必须要有至少 x 个从节点连接，如果小于这个数，主节点会禁止写数据。
- min-slaves-max-lag x，主从数据复制和同步的延迟不能超过 x 秒，如果超过，主节点会禁止写数据。

<a name="o7plF"></a>

## Redis过期删除与内存淘汰

Redis使用的删除策略是【惰性删除+定期删除】这两种策略配合使用。
惰性删除: 不主动删除过期键，每次从数据库访问Key时，都检测Key是否过期，如果过期则删除该key
定期删除: 每隔一段时间【随机】从数据库中取出一定数量的Key进行检查，并删除其中的过期key

<a name="V6FI3"></a>

## Redis数据结构

- String 类型的应用场景：缓存对象、常规计数、分布式锁、共享 session 信息等。
- List 类型的应用场景：消息队列（但是有两个问题：1. 生产者需要自行实现全局唯一 ID；2. 不能以消费组形式消费数据）等。
- Hash 类型：缓存对象、购物车等。
- Set 类型：聚合计算（并集、交集、差集）场景，比如点赞、共同关注、抽奖活动等。
- Zset 类型：排序场景，比如排行榜、电话和姓名排序等。
- BitMap（2.2 版新增）：二值状态统计的场景，比如签到、判断用户登陆状态、连续签到用户总数等；
- HyperLogLog（2.8 版新增）：海量数据基数统计的场景，比如百万级网页 UV 计数等；
- GEO（3.2 版新增）：存储地理位置信息的场景，比如滴滴叫车；
- Stream（5.0 版新增）：消息队列，相比于基于 List 类型实现的消息队列，有这两个特有的特性：自动生成全局唯一消息ID，支持以消费组形式消费数据。

<a name="w7FFo"></a>

## 五种常见的Redis数据库是怎么实现的？

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709975287127-f0b2c01d-4b4e-4b59-91f9-e9f36252099f.png#averageHue=%23faf8ef&clientId=uf0c0aeab-6997-4&from=paste&height=586&id=u59b1c7e8&originHeight=586&originWidth=1045&originalType=binary&ratio=1&rotation=0&showTitle=false&size=159413&status=done&style=none&taskId=ufbd177ec-e014-48fb-a475-7af5838cbc7&title=&width=1045)

<a name="ocmXq"></a>

### redis 的键值对数据库是怎么实现的

在开始讲数据结构之前，先给介绍下 Redis 是怎样实现键值对（key-value）数据库的。
Redis 的键值对中的 key 就是字符串对象，而 **value 可以是字符串对象，也可以是集合数据类型的对象**，比如 List 对象、Hash 对象、Set 对象和 Zset 对象。

Redis 是使用了一个「哈希表」保存所有键值对，哈希表的最大好处就是让我们可以用 O(1) 的时间复杂度来快速查找到键值对。哈希表其实就是一个数组，数组中的元素叫做哈希桶。
Redis 的哈希桶是怎么保存键值对数据的呢？
哈希桶存放的是指向键值对数据的指针（dictEntry*），这样通过指针就能找到键值对数据，然后因为键值对的值可以保存字符串对象和集合数据类型的对象，所以键值对的数据结构中并不是直接保存值本身，而是保存了 void * key 和 void * value 指针，分别指向了实际的键对象和值对象，这样一来，即使值是集合数据，也可以通过 void * value 指针找到。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710834892948-0b5f0d24-b4ae-4c51-857f-027a6fed7900.png#averageHue=%23f9f6f3&clientId=u7103f469-2912-4&from=paste&id=ua9ecb679&originHeight=662&originWidth=1637&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u605a58b6-77ae-4cd2-aed5-f5fad8ccc25&title=)

- redisDb 结构，表示 Redis 数据库的结构，结构体里存放了指向了 dict 结构的指针；
- dict 结构，结构体里存放了 2 个哈希表，正常情况下都是用「哈希表1」，「哈希表2」只有在 rehash 的时候才用，具体什么是 rehash，我在本文的哈希表数据结构会讲；
- ditctht 结构，表示哈希表的结构，结构里存放了哈希表数组，数组中的每个元素都是指向一个哈希表节点结构（dictEntry）的指针；
- dictEntry 结构，表示哈希表节点的结构，结构里存放了 **void * key 和 void * value 指针， _key 指向的是 String 对象，而 value 则可以指向 String 对象，也可以指向集合类型的对象，比如 List 对象、Hash 对象、Set 对象和 Zset 对象_。

<a name="bSHHJ"></a>

### SDS  string的实现

Redis 是用 C 语言实现的，但是它没有直接使用 C 语言的 char* 字符数组来实现字符串，而是自己封装了一个名为简单动态字符串（simple dynamic string，SDS） 的数据结构来表示字符串，也就是 Redis 的 String 数据类型的底层数据结构是 SDS。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710835132398-5d66913d-3bb2-4c11-b2b2-01593640ed8c.png#averageHue=%23eaeaea&clientId=u7103f469-2912-4&from=paste&id=u482c1d03&originHeight=347&originWidth=407&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ue6d64ba7-ec33-40f1-ba34-b8a3d8618dd&title=)
结构中的每个成员变量分别介绍下：

- **len，记录了字符串长度**。这样获取字符串长度的时候，只需要返回这个成员变量值就行，时间复杂度只需要 O（1）。
- **alloc，分配给字符数组的空间长度**。这样在修改字符串的时候，可以通过 alloc - len 计算出剩余的空间大小，可以用来判断空间是否满足修改需求，如果不满足的话，就会自动将 SDS 的空间扩展至执行修改所需的大小，然后才执行实际的修改操作，所以使用 SDS 既不需要手动修改 SDS 的空间大小，也不会出现前面所说的缓冲区溢出的问题。
- **flags，用来表示不同类型的 SDS**。一共设计了 5 种类型，分别是 sdshdr5、sdshdr8、sdshdr16、sdshdr32 和 sdshdr64，后面在说明区别之处。
- **buf[]，字符数组，用来保存实际数据**。不仅可以保存字符串，也可以保存二进制数据。

总的来说，Redis 的 SDS 结构在原本字符数组之上，增加了三个元数据：len、alloc、flags，用来解决 C 语言字符串的缺陷

**好处**：

1. O(1)复杂度获取字符串长度
2. 二进制安全
3. 不会发生缓冲区溢出

- 如果所需的 sds 长度**小于 1 MB**，那么最后的扩容是按照**翻倍扩容**来执行的，即 2 倍的newlen
- 如果所需的 sds 长度**超过 1 MB**，那么最后的扩容长度应该是 newlen **+ 1MB**。

4. 节省内存SDS 结构中有个 flags 成员变量，表示的是 SDS 类型。

Redis 一共设计了 5 种类型，分别是 sdshdr5、sdshdr8、sdshdr16、sdshdr32 和 sdshdr64。
这 5 种类型的主要**区别就在于，它们数据结构中的 len 和 alloc 成员变量的数据类型不同**。

<a name="AefnE"></a>

### 链表

先来看看「链表节点」结构的样子：

```c
typedef struct listNode {
    //前置节点
    struct listNode *prev;
    //后置节点
    struct listNode *next;
    //节点的值
    void *value;
} listNode;
```

有前置节点和后置节点，可以看的出，这个是一个双向链表。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710835560718-1eba3f58-ee86-4a93-b4e9-63614887b56f.png#averageHue=%23f2f0e7&clientId=u7103f469-2912-4&from=paste&id=u18cb5eaa&originHeight=272&originWidth=1127&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u878a63ea-10e4-4432-bf91-c3ab1c7f562&title=)
不过，Redis 在 listNode 结构体基础上又封装了 list 这个数据结构，这样操作起来会更方便，链表结构如下：

```c
typedef struct list {
    //链表头节点
    listNode *head;
    //链表尾节点
    listNode *tail;
    //节点值复制函数
    void *(*dup)(void *ptr);
    //节点值释放函数
    void (*free)(void *ptr);
    //节点值比较函数
    int (*match)(void *ptr, void *key);
    //链表节点数量
    unsigned long len;
} list;
```

list 结构为链表提供了链表头指针 head、链表尾节点 tail、链表节点数量 len、以及可以自定义实现的 dup、free、match 函数。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710835938054-ca8e89cd-4333-410b-bd0b-041d3d480fe2.png#averageHue=%23f9f3f2&clientId=u7103f469-2912-4&from=paste&id=uabebb6b0&originHeight=512&originWidth=1449&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ue84c67d3-d718-4227-a47a-f1a2ebd4981&title=)

**链表的优势和劣势**
**Redis 的链表实现优点如下：**

- listNode 链表节点的结构里带有 prev 和 next 指针，**获取某个节点的前置节点或后置节点的时间复杂度只需O(1)，而且这两个指针都可以指向 NULL，所以链表是无环链表**；
- list 结构因为提供了表头指针 head 和表尾节点 tail，所以**获取链表的表头节点和表尾节点的时间复杂度只需O(1)**；
- list 结构因为提供了链表节点数量 len，所以**获取链表中的节点数量的时间复杂度只需O(1)**；
- listNode 链表节使用 void* 指针保存节点值，并且可以通过 list 结构的 dup、free、match 函数指针为节点设置该节点类型特定的函数，因此**链表节点可以保存各种不同类型的值**；

**链表的缺陷也是有的：**

- 链表每个节点之间的内存都是不连续的，意味着**无法很好利用 CPU 缓存**。能很好利用 CPU 缓存的数据结构就是数组，因为数组的内存是连续的，这样就可以充分利用 CPU 缓存来加速访问。
- 还有一点，保存一个链表节点的值都需要一个链表节点结构头的分配，**内存开销较大**。

<a name="kO6CA"></a>

### 压缩链表

**压缩列表的最大特点**，就是它被设计成一种**内存紧凑型的数据结构**，占用一块连续的内存空间，不仅可以利用 CPU 缓存，而且会针对不同长度的数据，进行相应编码，这种方法可以有效地节省内存开销。
但是，压缩列表的缺陷也是有的：

- 不能保存过多的元素，否则查询效率就会降低；
- 新增或修改某个元素时，压缩列表占用的内存空间需要重新分配，甚至可能引发连锁更新的问题。

因此，Redis 对象（List 对象、Hash 对象、Zset 对象）包含的元素数量较少，或者元素值不大的情况才会使用压缩列表作为底层数据结构。

压缩列表是 Redis 为了节约内存而开发的，它是**由连续内存块组成的顺序型数据结构**，有点类似于数组。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710836447374-69e85f13-8ca2-4eb5-bbf1-d9b4fc2c311a.png#averageHue=%23cce1ca&clientId=u7103f469-2912-4&from=paste&id=u6a128f16&originHeight=62&originWidth=962&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u558ff954-a166-42b7-9d79-2c37487870c&title=)
压缩列表在表头有三个字段：

- _**zlbytes**_，记录整个压缩列表占用对内存字节数；
- _**zltail**_，记录压缩列表「尾部」节点距离起始地址由多少字节，也就是列表尾的偏移量；
- _**zllen**_，记录压缩列表包含的节点数量；
- _**zlend**_，标记压缩列表的结束点，固定值 0xFF（十进制255）。

在压缩列表中，如果我们要查找定位第一个元素和最后一个元素，可以通过表头三个字段（zllen）的长度直接定位，复杂度是 O(1)。而**查找其他元素时，就没有这么高效了，只能逐个查找，此时的复杂度就是 O(N) 了，因此压缩列表不适合保存过多的元素**。
另外，压缩列表节点（entry）的构成如下：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710836592715-169171a3-f055-48be-bf78-e81bd3972630.png#averageHue=%23fbf8f6&clientId=u7103f469-2912-4&from=paste&id=uee2c85e8&originHeight=302&originWidth=962&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ue4cf88f7-616b-498c-9fce-d9d6e91604d&title=)
压缩列表节点包含三部分内容：

- _**prevlen**_，记录了「前一个节点」的长度，目的是为了实现从后向前遍历；
- _**encoding**_，记录了当前节点实际数据的「类型和长度」，类型主要有两种：字符串和整数。
- _**data**_，记录了当前节点的实际数据，类型和长度都由 encoding 决定；

当我们往压缩列表中插入数据时，压缩列表就会根据数据类型是字符串还是整数，以及数据的大小，会使用不同空间大小的 prevlen 和 encoding 这两个元素里保存的信息，**这种根据数据大小和类型进行不同的空间大小分配的设计思想，正是 Redis 为了节省内存而采用的**。
分别说下，prevlen 和 encoding 是如何根据数据的大小和类型来进行不同的空间大小分配。
压缩列表里的每个节点中的 prevlen 属性都记录了「前一个节点的长度」，而且 prevlen 属性的空间大小跟前一个节点长度值有关，比如：

- 如果**前一个节点的长度小于 254 字节**，那么 prevlen 属性需要用 **1 字节的空间**来保存这个长度值；
- 如果**前一个节点的长度大于等于 254 字节**，那么 prevlen 属性需要用 **5 字节的空间**来保存这个长度值；

**连锁更新问题**
**压缩列表新增某个元素或修改某个元素时，如果空间不不够，压缩列表占用的内存空间就需要重新分配。而当新插入的元素较大时，可能会导致后续元素的 prevlen 占用空间都发生变化，从而引起「连锁更新」问题，导致每个元素的空间都要重新分配，造成访问压缩列表性能的下降**。

<a name="bM57u"></a>

### 哈希表

哈希表是一种保存键值对（key-value）的数据结构。
**Redis 采用了「链式哈希」来解决哈希冲突**，在不扩容哈希表的前提下，将具有相同哈希值的数据串起来，形成链接起，以便这些数据在表中仍然可以被查询到。

```c
typedef struct dictht {
    //哈希表数组
    dictEntry **table;
    //哈希表大小
    unsigned long size;  
    //哈希表大小掩码，用于计算索引值
    unsigned long sizemask;
    //该哈希表已有的节点数量
    unsigned long used;
} dictht;
```

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710836777027-3b68941c-046f-4e1e-a818-c181f67827a6.png#averageHue=%23faf0ec&clientId=u7103f469-2912-4&from=paste&id=ua414477a&originHeight=587&originWidth=1052&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u6ceaea78-177d-4469-b6f7-899d0124a7f&title=)

```c
typedef struct dictEntry {
    //键值对中的键
    void *key;
  
    //键值对中的值
    union {
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;
    //指向下一个哈希表节点，形成链表
    struct dictEntry *next;
} dictEntry;
```

**哈希冲突**
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710836963816-30b717e1-0207-460f-bb5b-703496ae90ff.png#averageHue=%23edc3c1&clientId=u7103f469-2912-4&from=paste&id=u7d27ecd1&originHeight=527&originWidth=812&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ueb026312-0ed9-4323-96e8-f368ff4cb22&title=)

**链式哈希**
Redis 采用了「**链式哈希**」的方法来解决哈希冲突。
链式哈希是怎么实现的？
实现的方式就是每个哈希表节点都有一个 next 指针，用于指向下一个哈希表节点，因此多个哈希表节点可以用 next 指针构成一个单项链表，**被分配到同一个哈希桶上的多个节点可以用这个单项链表连接起来**，这样就解决了哈希冲突。
还是用前面的哈希冲突例子，key1 和 key9 经过哈希计算后，都落在同一个哈希桶，链式哈希的话，key1 就会通过 next 指针指向 key9，形成一个单向链表。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710837000567-d128660e-44ee-46cd-b6e0-e4ac09866a29.png#averageHue=%23f8f8f8&clientId=u7103f469-2912-4&from=paste&id=u79b684c6&originHeight=527&originWidth=1067&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uba1b5557-2ad3-42e3-a952-fab276fe802&title=)
不过，链式哈希局限性也很明显，随着链表长度的增加，在查询这一位置上的数据的耗时就会增加，毕竟链表的查询的时间复杂度是 O(n)。
要想解决这一问题，就需要进行 rehash，也就是对哈希表的大小进行扩展。
接下来，看看 Redis 是如何实现的 rehash 的。

<a name="zeHnY"></a>

### redis的rehash

哈希表结构设计的这一小节，我给大家介绍了 Redis 使用 dictht 结构体表示哈希表。不过，在实际使用哈希表时，Redis 定义一个 dict 结构体，这个结构体里定义了**两个哈希表（ht[2]）**。

```c
typedef struct dict {
    …
    //两个Hash表，交替使用，用于rehash操作
    dictht ht[2]; 
    …
} dict;
```

之所以定义了 2 个哈希表，是因为进行 rehash 的时候，需要用上 2 个哈希表了。
在正常服务请求阶段，插入的数据，都会写入到「哈希表 1」，此时的「哈希表 2 」 并没有被分配空间。
随着数据逐步增多，触发了 rehash 操作，这个过程分为三步：

- 给「哈希表 2」 分配空间，一般会比「哈希表 1」 大一倍（两倍的意思）；
- 将「哈希表 1 」的数据迁移到「哈希表 2」 中；
- 迁移完成后，「哈希表 1 」的空间会被释放，并把「哈希表 2」 设置为「哈希表 1」，然后在「哈希表 2」 新创建一个空白的哈希表，为下次 rehash 做准备。

为了方便你理解，我把 rehash 这三个过程画在了下面这张图：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710837141863-3ed3ef33-c6ce-4625-bf25-5db36a6a2278.png#averageHue=%23f8f6f0&clientId=u7103f469-2912-4&from=paste&id=ue84d40f1&originHeight=699&originWidth=1344&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u08503bfd-8b01-49ca-a81a-af2ed70323e&title=)

为了避免 rehash 在数据迁移过程中，因拷贝数据的耗时，影响 Redis 性能的情况，所以 Redis 采用了**渐进式 rehash**，也就是将数据的迁移的工作不再是一次性迁移完成，而是分多次迁移。
**渐进式 rehash 步骤如下：**

- 给「哈希表 2」 分配空间；
- **在 rehash 进行期间，每次哈希表元素进行新增、删除、查找或者更新操作时，Redis 除了会执行对应的操作之外，还会顺序将「哈希表 1 」中索引位置上的所有 key-value 迁移到「哈希表 2」 上**；
- 随着处理客户端发起的哈希表操作请求数量越多，最终在某个时间点会把「哈希表 1 」的所有 key-value 迁移到「哈希表 2」，从而完成 rehash 操作。

**rehash的触发条件**
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710837353339-8b862f4f-8717-4a95-b3ce-bcba6c2645d2.png#averageHue=%23ead1b4&clientId=u7103f469-2912-4&from=paste&id=u9df61241&originHeight=77&originWidth=617&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u792f1f78-bd70-4bdd-9efe-26413d913c5&title=)
触发 rehash 操作的条件，主要有两个：

- **当负载因子大于等于 1 ，并且 Redis 没有在执行 bgsave 命令或者 bgrewiteaof 命令，也就是没有执行 RDB 快照或没有进行 AOF 重写的时候，就会进行 rehash 操作。**
- **当负载因子大于等于 5 时，此时说明哈希冲突非常严重了，不管有没有有在执行 RDB 快照或 AOF 重写，都会强制进行 rehash 操作。**

<a name="NES7F"></a>

### 跳表

Redis 只有 Zset 对象的底层实现用到了跳表，跳表的优势是能支持平均 O(logN) 复杂度的节点查找。

```c
typedef struct zset {
    dict *dict;
    zskiplist *zsl;
} zset;
```

zset 结构体里有两个数据结构：一个是跳表，一个是哈希表。这样的好处是既能进行高效的范围查询，也能进行高效单点查询。
链表在查找元素的时候，因为需要逐一查找，所以查询效率非常低，时间复杂度是O(N)，于是就出现了跳表。**跳表是在链表基础上改进过来的，实现了一种「多层」的有序链表**，这样的好处是能快读定位数据。
那跳表长什么样呢？我这里举个例子，下图展示了一个层级为 3 的跳表。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710837465224-ae5b163e-9836-421c-af98-7a055ccbf1c5.png#averageHue=%23f8f5f3&clientId=u7103f469-2912-4&from=paste&id=ucd625e61&originHeight=287&originWidth=1164&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u56d5a5e8-2a82-4d9b-9b60-11dd6f549cb&title=)

```c
typedef struct zskiplistNode {
    //Zset 对象的元素值
    sds ele;
    //元素权重值
    double score;
    //后向指针
    struct zskiplistNode *backward;
  
    //节点的level数组，保存每层上的前向指针和跨度
    struct zskiplistLevel {
        struct zskiplistNode *forward;
        unsigned long span;
    } level[];
} zskiplistNode;
```

Zset 对象要同时保存「元素」和「元素的权重」，对应到跳表节点结构里就是 sds 类型的 ele 变量和 double 类型的 score 变量。每个跳表节点都有一个后向指针（struct zskiplistNode *backward），指向前一个节点，目的是为了方便从跳表的尾节点开始访问节点，这样倒序查找时很方便。
跳表是一个带有层级关系的链表，而且每一层级可以包含多个节点，每一个节点通过指针连接起来，实现这一特性就是靠跳表节点结构体中的**zskiplistLevel 结构体类型的 level 数组**。
level 数组中的每一个元素代表跳表的一层，也就是由 zskiplistLevel 结构体表示，比如 leve[0] 就表示第一层，leve[1] 就表示第二层。zskiplistLevel 结构体里定义了「指向下一个跳表节点的指针」和「跨度」，跨度时用来记录两个节点之间的距离。

**跳表结点的查询过程**
查找一个跳表节点的过程时，跳表会从头节点的最高层开始，逐一遍历每一层。在遍历某一层的跳表节点时，会用跳表节点中的 SDS 类型的元素和元素的权重来进行判断，共有两个判断条件：

- 如果当前节点的权重「小于」要查找的权重时，跳表就会访问该层上的下一个节点。
- 如果当前节点的权重「等于」要查找的权重时，并且当前节点的 SDS 类型数据「小于」要查找的数据时，跳表就会访问该层上的下一个节点。

如果上面两个条件都不满足，或者下一个节点为空时，跳表就会使用目前遍历到的节点的 level 数组里的下一层指针，然后沿着下一层指针继续查找，这就相当于跳到了下一层接着查找。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710837553463-08243cba-110e-4de9-a0b2-d9f4df4f0cf4.png#averageHue=%23f8f5f3&clientId=u7103f469-2912-4&from=paste&id=ud7b4a376&originHeight=437&originWidth=2387&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ub1c18fef-92fc-4665-8df4-757fe511aca&title=)
如果要查找「元素：abcd，权重：4」的节点，查找的过程是这样的：

- 先从头节点的最高层开始，L2 指向了「元素：abc，权重：3」节点，这个节点的权重比要查找节点的小，所以要访问该层上的下一个节点；
- 但是该层的下一个节点是空节点（ leve[2]指向的是空节点），于是就会跳到「元素：abc，权重：3」节点的下一层去找，也就是 leve[1];
- 「元素：abc，权重：3」节点的 leve[1] 的下一个指针指向了「元素：abcde，权重：4」的节点，然后将其和要查找的节点比较。虽然「元素：abcde，权重：4」的节点的权重和要查找的权重相同，但是当前节点的 SDS 类型数据「大于」要查找的数据，所以会继续跳到「元素：abc，权重：3」节点的下一层去找，也就是 leve[0]；
- 「元素：abc，权重：3」节点的 leve[0] 的下一个指针指向了「元素：abcd，权重：4」的节点，该节点正是要查找的节点，查询结束。

**跳表层数的设置**
Redis 则采用一种巧妙的方法是，**跳表在创建节点的时候，随机生成每个节点的层数**，并没有严格维持相邻两层的节点数量比例为 2 : 1 的情况。
具体的做法是，**跳表在创建节点时候，会生成范围为[0-1]的一个随机数，如果这个随机数小于 0.25（相当于概率 25%），那么层数就增加 1 层，然后继续生成下一个随机数，直到随机数的结果大于 0.25 结束，最终确定该节点的层数**。
这样的做法，相当于每增加一层的概率不超过 25%，层数越高，概率越低，层高最大限制是 64。

**为什么使用跳表不用平衡树**
简单翻译一下，主要是从内存占用、对范围查找的支持、实现难易程度这三方面总结的原因：

- 它们不是非常内存密集型的。基本上由你决定。改变关于节点具有给定级别数的概率的参数将使其比 btree 占用更少的内存。
- Zset 经常需要执行 ZRANGE 或 ZREVRANGE 的命令，即作为链表遍历跳表。通过此操作，跳表的缓存局部性至少与其他类型的平衡树一样好。
- 它们更易于实现、调试等。例如，由于跳表的简单性，我收到了一个补丁（已经在Redis master中），其中扩展了跳表，在 O(log(N) 中实现了 ZRANK。它只需要对代码进行少量修改。

我再详细补充点：

- **从内存占用上来比较，跳表比平衡树更灵活一些**。平衡树每个节点包含 2 个指针（分别指向左右子树），而跳表每个节点包含的指针数目平均为 1/(1-p)，具体取决于参数 p 的大小。如果像 Redis里的实现一样，取 p=1/4，那么平均每个节点包含 1.33 个指针，比平衡树更有优势。
- **在做范围查找的时候，跳表比平衡树操作要简单**。在平衡树上，我们找到指定范围的小值之后，还需要以中序遍历的顺序继续寻找其它不超过大值的节点。如果不对平衡树进行一定的改造，这里的中序遍历并不容易实现。而在跳表上进行范围查找就非常简单，只需要在找到小值之后，对第 1 层链表进行若干步的遍历就可以实现。
- **从算法实现难度上来比较，跳表比平衡树要简单得多**。平衡树的插入和删除操作可能引发子树的调整，逻辑复杂，而跳表的插入和删除只需要修改相邻节点的指针，操作简单又快速。

<a name="S8K5o"></a>

### quicklist

quicklist 的结构体跟链表的结构体类似，都包含了表头和表尾，区别在于 quicklist 的节点是 quicklistNode。

```c
typedef struct quicklist {
    //quicklist的链表头
    quicklistNode *head;      //quicklist的链表头
    //quicklist的链表尾
    quicklistNode *tail; 
    //所有压缩列表中的总元素个数
    unsigned long count;
    //quicklistNodes的个数
    unsigned long len;     
    ...
} quicklist;
```

接下来看看，quicklistNode 的结构定义：

```c
typedef struct quicklistNode {
    //前一个quicklistNode
    struct quicklistNode *prev;     //前一个quicklistNode
    //下一个quicklistNode
    struct quicklistNode *next;     //后一个quicklistNode
    //quicklistNode指向的压缩列表
    unsigned char *zl;            
    //压缩列表的的字节大小
    unsigned int sz;              
    //压缩列表的元素个数
    unsigned int count : 16;        //ziplist中的元素个数 
    ....
} quicklistNode;
```

```c
typedef struct quicklistNode {
    //前一个quicklistNode
    struct quicklistNode *prev;     //前一个quicklistNode
    //下一个quicklistNode
    struct quicklistNode *next;     //后一个quicklistNode
    //quicklistNode指向的压缩列表
    unsigned char *zl;            
    //压缩列表的的字节大小
    unsigned int sz;              
    //压缩列表的元素个数
    unsigned int count : 16;        //ziplist中的元素个数 
    ....
} quicklistNode;
```

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710837947913-4cd70ba1-9d06-4e95-a3ab-d6931ec65560.png#averageHue=%23f6f5f2&clientId=u7103f469-2912-4&from=paste&id=u8e2d6fe0&originHeight=299&originWidth=944&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u390de269-4a38-44a4-9d97-25361c79ba3&title=)
可以看到，quicklistNode 结构体里包含了前一个节点和下一个节点指针，这样每个 quicklistNode 形成了一个双向链表。但是链表节点的元素不再是单纯保存元素值，而是**保存了一个压缩列表**，所以 quicklistNode 结构体里有个指向压缩列表的指针 *zl。

<a name="A5ekz"></a>

### listpack

quicklist 虽然通过控制 quicklistNode 结构里的压缩列表的大小或者元素个数，来减少连锁更新带来的性能影响，但是并没有完全解决连锁更新的问题。

**listpack** 采用了压缩列表的很多优秀的设计，比如还是用一块连续的内存空间来紧凑地保存数据，并且为了节省内存的开销，listpack 节点会采用不同的编码方式保存不同大小的数据。
我们先看看 listpack 结构：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710838113325-468b6965-c20f-4bd2-83ca-2c9849838ad0.png#averageHue=%238893a2&clientId=u7103f469-2912-4&from=paste&id=u8538c578&originHeight=77&originWidth=1082&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud28bf316-a77b-41e8-a42d-e91b29ec69e&title=)
listpack 头包含两个属性，**分别记录了 listpack 总字节数**和**元素数量**，然后 listpack 末尾也有个结尾标识。图中的 listpack entry 就是 listpack 的节点了。
**每个 listpack 节点结构如下：**
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710838140848-abb1b9c4-a1c9-416c-a3a1-fce3e01290a3.png#averageHue=%23faedc8&clientId=u7103f469-2912-4&from=paste&id=u7d838e3e&originHeight=317&originWidth=1082&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua4ed6c23-63b2-4782-8349-5c4190046e9&title=)
主要包含三个方面内容：

- **encoding**，定义该元素的编码类型，会对不同长度的整数和字符串进行编码；
- **data**，实际存放的数据；
- **len**，**encoding+data**的总长度；

可以看到，**listpack 没有压缩列表中记录前一个节点长度的字段了，listpack 只记录当前节点的长度，当我们向 listpack 加入一个新元素的时候，不会影响其他节点的长度字段的变化，从而避免了压缩列表的连锁更新问题**。

<a name="Ka1Qv"></a>

## Redis常见数据类型和应用场景

<a name="wocbF"></a>

### String

1. 缓存对象
2. 常规计数
3. 分布式锁

<a name="oFZOH"></a>

### List

[https://xiaolincoding.com/redis/data_struct/command.html#%E5%BA%94%E7%94%A8%E5%9C%BA%E6%99%AF-2](https://xiaolincoding.com/redis/data_struct/command.html#%E5%BA%94%E7%94%A8%E5%9C%BA%E6%99%AF-2)

1. 消息队列
2. **如何保证消息满足需求？**

List 本身就是按先进先出的顺序对数据进行存取的，所以，如果使用 List 作为消息队列保存消息的话，就已经能满足消息保序的需求了。
List 可以使用 LPUSH + RPOP （或者反过来，RPUSH+LPOP）命令实现消息队列。
**不过，在消费者读取数据时，有一个潜在的性能风险点。**
在生产者往 List 中写入数据时，List 并不会主动地通知消费者有新消息写入，如果消费者想要及时处理消息，就需要在程序中不停地调用 RPOP 命令（比如使用一个while(1)循环）。如果有新消息写入，RPOP命令就会返回结果，否则，RPOP命令返回空值，再继续循环。
所以，即使没有新消息写入List，消费者也要不停地调用 RPOP 命令，这就会导致消费者程序的 CPU 一直消耗在执行 RPOP 命令上，带来不必要的性能损失。
为了解决这个问题，Redis提供了 BRPOP 命令。**BRPOP命令也称为阻塞式读取，客户端在没有读到队列数据时，自动阻塞，直到有新的数据写入队列，再开始读取新数据**。和消费者程序自己不停地调用RPOP命令相比，这种方式能节省CPU开销。

2. **如何处理重复的消息**

首先消息的重复性有2方面的需求：

- **每个消息都有一个全局的 ID。**
- 消费者要记录已经处理过的消息的 ID。当收到一条消息后，消费者程序就可以对比收到的消息 ID 和记录的已处理过的消息 ID，来判断当前收到的消息有没有经过处理。如果已经处理过，那么，消费者程序就不再进行处理了

**List 并不会为每个消息生成 ID 号，所以我们需要自行为每个消息生成一个全局唯一ID**，生成之后，我们在用 LPUSH 命令把消息插入 List 时，需要在消息中包含这个全局唯一 ID。

3. **如何保证消息的可靠性**

当消费者程序从 List 中读取一条消息后，List 就不会再留存这条消息了。所以，如果消费者程序在处理消息的过程出现了故障或宕机，就会导致消息没有处理完成，那么，消费者程序再次启动后，就没法再次从 List 中读取消息了。
为了留存消息，List 类型提供了** BRPOPLPUSH** 命令，这个命令的**作用是让消费者程序从一个 List 中读取消息，同时，Redis 会把这个消息再插入到另一个 List（可以叫作备份 List）留存**。

- 消息保序：使用 LPUSH + RPOP；
- 阻塞读取：使用 BRPOP；
- 重复消息处理：生产者自行实现全局唯一 ID；
- 消息的可靠性：使用 BRPOPLPUSH

**缺点？**
**List 不支持多个消费者消费同一条消息**，因为一旦消费者拉取一条消息后，这条消息就从 List 中删除了，无法被其它消费者再次消费。
要实现一条消息可以被多个消费者消费，那么就要将多个消费者组成一个消费组，使得多个消费者可以消费同一条消息，但是 **List 类型并不支持消费组的实现**。

<a name="rSZmY"></a>

### Hash

1. 缓存对象
2. 购物车

涉及的命令如下：

- 添加商品：HSET cart:{用户id} {商品id} 1
- 添加数量：HINCRBY cart:{用户id} {商品id} 1
- 商品总数：HLEN cart:{用户id}
- 删除商品：HDEL cart:{用户id} {商品id}
- 获取购物车所有商品：HGETALL cart:{用户id}

<a name="wGxQP"></a>

### Set

1. **点赞**：Set 类型可以保证一个用户只能点一个赞，这里举例子一个场景，key 是文章id，value 是用户id。uid:1 、uid:2、uid:3 三个用户分别对 article:1 文章点赞了。
2. **共同关注**：Set 类型支持交集运算，所以可以用来计算共同关注的好友、公众号等。key 可以是用户id，value 则是已关注的公众号的id。uid:1 用户关注公众号 id 为 5、6、7、8、9，uid:2 用户关注公众号 id 为 7、8、9、10、11。
3. **抽奖活动：**如果允许重复中奖，可以使用 SRANDMEMBER 命令。如果不允许重复中奖，可以使用 SPOP 命令。

<a name="g4ZYi"></a>

### ZSet

1. 排行榜：有序集合比较典型的使用场景就是排行榜。例如学生成绩的排名榜、游戏积分排行榜、视频播放排名、电商系统中商品的销量排名等。
2. 电话姓名的排序：

<a name="gUCec"></a>

### BitMap

1. 签到统计
2. 判断用户登录状态
3. 连续签到用户总数

<a name="ZlZzh"></a>

### HyperLogLog

1. **百万级网页UV计数**

<a name="WM6JX"></a>

### GEO

1. **滴滴叫车**

<a name="tkmEX"></a>

### Stream

1. **消息队列**

生产者通过 XADD 命令插入一条消息：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710907263283-725a20e9-1ad7-4999-964c-040f7c3ab9ed.png#averageHue=%23ebebeb&clientId=u54fe126c-6b6a-4&from=paste&id=u40367fa7&originHeight=123&originWidth=577&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u4a2489c3-110e-43cf-a755-17708730d3a&title=)

前面介绍的这些操作 List 也支持的，接下来看看 Stream 特有的功能。
Stream 可以以使用 **XGROUP 创建消费组**，创建消费组之后，Stream 可以使用 XREADGROUP 命令让消费组内的消费者读取消息。
创建两个消费组，这两个消费组消费的消息队列是 mymq，都指定从第一条消息开始读取：

> **基于 Stream 实现的消息队列，如何保证消费者在发生故障或宕机再次重启后，仍然可以读取未处理完的消息？**

Streams 会自动使用内部队列（也称为 PENDING List）留存消费组里每个消费者读取的消息，直到消费者使用 XACK 命令通知 Streams“消息已经处理完成”。
消费确认增加了消息的可靠性，一般在业务处理完成之后，需要执行 XACK 命令确认消息已经被消费完成，整个流程的执行如下图所示
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710907302262-eaed028f-9ea9-4b40-8b50-4c27bc64f3da.png#averageHue=%23fcfcfc&clientId=u54fe126c-6b6a-4&from=paste&id=u9a2dbb36&originHeight=482&originWidth=1170&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u9f53e70a-2d75-449c-a7e6-6f49e8d72c7&title=)
如果消费者没有成功处理消息，它就不会给 Streams 发送 XACK 命令，消息仍然会留存。此时，**消费者可以在重启后，用 XPENDING 命令查看已读取、但尚未确认处理完成的消息**。

好了，基于 Stream 实现的消息队列就说到这里了，小结一下：

- 消息保序：XADD/XREAD
- 阻塞读取：XREAD block
- 重复消息处理：Stream 在使用 XADD 命令，会自动生成全局唯一 ID；
- 消息可靠性：内部使用 PENDING List 自动保存消息，使用 XPENDING 命令查看消费组已经读取但是未被确认的消息，消费者使用 XACK 确认消息；
- 支持消费组形式消费数据

<a name="TfR4A"></a>

## Redis的过期策略与内存淘汰策略有什么区别

Redis 使用的过期删除策略是「惰性删除+定期删除」，删除的对象是已过期的 key。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710838718253-b06f7720-a7a3-42ef-bac9-1906f368cea3.png#averageHue=%23f1f1f1&clientId=u7103f469-2912-4&from=paste&id=uf8d0e7f5&originHeight=260&originWidth=1750&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u38a4a42e-f6ce-405b-a89d-154c92e9f4d&title=)

内存淘汰策略是解决内存过大的问题，当 Redis 的运行内存超过最大运行内存时，就会触发内存淘汰策略，Redis 4.0 之后共实现了 8 种内存淘汰策略，我也对这 8 种的策略进行分类，如下：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710838730260-f8df0597-877b-4d8a-b27f-515e79bab7a6.png#averageHue=%23f6f6f6&clientId=u7103f469-2912-4&from=paste&id=ub11e793f&originHeight=804&originWidth=2540&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uf73af15f-19bc-49ff-855d-65968d9847b&title=)

<a name="AUM38"></a>

## Redis的缓存策略

由于数据存储受限，系统并不是将所有数据都需要存放到缓存中的，而**只是将其中一部分热点数据缓存起来**，所以我们要设计一个热点数据动态缓存的策略。
热点数据动态缓存的策略总体思路：**通过数据最新访问时间来做排名，并过滤掉不常访问的数据，只留下经常访问的数据**。
以电商平台场景中的例子，现在要求只缓存用户经常访问的 Top 1000 的商品。具体细节如下：

- 先通过缓存系统做一个排序队列（比如存放 1000 个商品），系统会根据商品的访问时间，更新队列信息，越是最近访问的商品排名越靠前；
- 同时系统会定期过滤掉队列中排名最后的 200 个商品，然后再从数据库中随机读取出 200 个商品加入队列中；
- 这样当请求每次到达的时候，会先从队列中获取商品 ID，如果命中，就根据 ID 再从另一个缓存数据结构中读取实际的商品信息，并返回。

在 Redis 中可以用 zadd 方法和 zrange 方法来完成排序队列和获取 200 个商品的操作。

<a name="sP67b"></a>

## Redis实战

<a name="EPDKv"></a>

### Redis如何实现延迟队列

采用zset来实现
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709827558195-bc773d8a-fb3d-45ee-aed2-df552014c436.png#averageHue=%23f5f5f5&clientId=u8d88e84c-6e84-4&from=paste&height=338&id=u80f6bbb1&originHeight=338&originWidth=1336&originalType=binary&ratio=1&rotation=0&showTitle=false&size=139001&status=done&style=none&taskId=u482a8dac-f9d6-43bd-af5b-d5550e3469a&title=&width=1336)

<a name="gYDRd"></a>

### Redis管道有什么作用？

管道技术（Pipeline）是客户端提供的一种批处理技术，用于一次处理多个 Redis 命令，从而提高整个交互的性能。
普通命令模式，如下图所示：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709827614080-7731ddab-98c2-4ba4-957f-b651c35762fe.png#averageHue=%23f5efdc&clientId=u8d88e84c-6e84-4&from=paste&height=443&id=u0c84b313&originHeight=443&originWidth=1008&originalType=binary&ratio=1&rotation=0&showTitle=false&size=59351&status=done&style=none&taskId=ub7654808-8d29-49c1-8feb-7c78ae1ad55&title=&width=1008)

管道模式，如下图所示：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709827623821-b5a2622f-3632-475d-807c-92debd4a566c.png#averageHue=%23f5efdc&clientId=u8d88e84c-6e84-4&from=paste&height=449&id=ue93ee5de&originHeight=449&originWidth=990&originalType=binary&ratio=1&rotation=0&showTitle=false&size=56825&status=done&style=none&taskId=u30c64b03-8a34-4ae9-b6bf-18e19051053&title=&width=990)

使用**管道技术可以解决多个命令执行时的网络等待**，它是把多个命令整合到一起发送给服务器端处理之后统一返回给客户端，这样就免去了每条命令执行后都要等待的情况，从而有效地提高了程序的执行效率。
但使用管道技术也要注意避免发送的命令过大，或管道内的数据太多而导致的网络阻塞。
要注意的是，管道技术本质上是客户端提供的功能，而非 Redis 服务器端的功能。

<a name="LRqjC"></a>

### 如何使用Redis实现分布式锁？

分布式锁是用于分布式环境下并发控制的一种机制，用于控制某个资源在同一时刻只能被一个应用所使用：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709827858378-a4f0c7d5-e2c6-4f88-96f4-5473e5db8cbe.png#averageHue=%23fbfafa&clientId=u8d88e84c-6e84-4&from=paste&height=456&id=u072938e4&originHeight=456&originWidth=1048&originalType=binary&ratio=1&rotation=0&showTitle=false&size=89202&status=done&style=none&taskId=u4edbd985-8c45-46ab-a565-591fe69a705&title=&width=1048)

Redis 的set命令有一个 nx 的参数，正好就是一个共享存储系统，可以用来保存分布式锁，而且Redis 的去写性能高，可以应对高并发的锁场景。

```c
SET lock_key unique_value NX PX 10000
```

- lock_key 就是 key 键；
- unique_value 是客户端生成的唯一的标识，区分来自不同客户端的锁操作；
- NX 代表只在 lock_key 不存在时，才对 lock_key 进行设置操作；
- PX 10000 表示设置 lock_key 的过期时间为 10s，这是为了避免客户端发生异常而无法释放锁。

而解锁的过程就是将 lock_key 键删除（del lock_key），但不能乱删，要保证执行操作的客户端就是加锁的客户端。所以，解锁的时候，我们要先判断锁的 unique_value 是否为加锁客户端，是的话，才将 lock_key 键删除。
可以看到，解锁是有两个操作，这时就需要 Lua 脚本来保证解锁的原子性，因为 Redis 在执行 Lua 脚本时，可以以原子性的方式执行，保证了锁释放操作的原子性。

```lua
// 释放锁时，先比较 unique_value 是否相等，避免锁的误释放
if redis.call("get",KEYS[1]) == ARGV[1] then
  return redis.call("del",KEYS[1])
else
  return 0
end
```

这样一来，就通过使用 SET 命令和 Lua 脚本在 Redis 单节点上完成了分布式锁的加锁和解锁。

> 基于Redis 实现分布式锁有什么优缺点？

优点：

1. 性能高效（这是选择缓存实现分布式锁最核心的出发点）。
2. 实现方便。很多研发工程师选择使用 Redis 来实现分布式锁，很大成分上是因为 Redis 提供了 setnx 方法，实现分布式锁很方便。
3. 避免单点故障（因为 Redis 是跨集群部署的，自然就避免了单点故障）。

缺点：

- **超时时间不好设置**。如果锁的超时时间设置过长，会影响性能，如果设置的超时时间过短会保护不到共享资源。比如在有些场景中，一个线程 A 获取到了锁之后，由于业务代码执行时间可能比较长，导致超过了锁的超时时间，自动失效，注意 A 线程没执行完，后续线程 B 又意外的持有了锁，意味着可以操作共享资源，那么两个线程之间的共享资源就没办法进行保护了。
  - **那么如何合理设置超时时间呢？** 我们可以基于续约的方式设置超时时间：先给锁设置一个超时时间，然后启动一个守护线程，让守护线程在一段时间后，重新设置这个锁的超时时间。实现方式就是：写一个守护线程，然后去判断锁的情况，当锁快失效的时候，再次进行续约加锁，当主线程执行完成后，销毁续约锁即可，不过这种方式实现起来相对复杂。
- **Redis 主从复制模式中的数据是异步复制的，这样导致分布式锁的不可靠性**。如果在 Redis 主节点获取到锁后，在没有同步到其他节点时，Redis 主节点宕机了，此时新的 Redis 主节点依然可以获取锁，所以多个应用服务就可以同时获取到锁。

> 如何解决 Redis 集群情况下 分布式锁的可靠性？

为了保证集群环境下分布式锁的可靠性，Redis 官方已经设计了一个分布式锁算法 Redlock（红锁）。
它是基于**多个 Redis 节点**的分布式锁，即使有节点发生了故障，锁变量仍然是存在的，客户端还是可以完成锁操作。官方推荐是至少部署 5 个 Redis 节点，而且都是主节点，它们之间没有任何关系，都是一个个孤立的节点。
Redlock 算法的基本思路，**是让客户端和多个独立的 Redis 节点依次请求申请加锁，如果客户端能够和半数以上的节点成功地完成加锁操作，那么我们就认为，客户端成功地获得分布式锁，否则加锁失败**。
这样一来，即使有某个 Redis 节点发生故障，因为锁的数据在其他节点上也有保存，所以客户端仍然可以正常地进行锁操作，锁的数据也不会丢失。
Redlock 算法加锁三个过程：

- 第一步是，客户端获取当前时间（t1）。
- 第二步是，客户端按顺序依次向 N 个 Redis 节点执行加锁操作：
  - 加锁操作使用 SET 命令，带上 NX，EX/PX 选项，以及带上客户端的唯一标识。
  - 如果某个 Redis 节点发生故障了，为了保证在这种情况下，Redlock 算法能够继续运行，我们需要给「加锁操作」设置一个超时时间（不是对「锁」设置超时时间，而是对「加锁操作」设置超时时间），加锁操作的超时时间需要远远地小于锁的过期时间，一般也就是设置为几十毫秒。
- 第三步是，一旦客户端从超过半数（大于等于 N/2+1）的 Redis 节点上成功获取到了锁，就再次获取当前时间（t2），然后计算计算整个加锁过程的总耗时（t2-t1）。如果 t2-t1 < 锁的过期时间，此时，认为客户端加锁成功，否则认为加锁失败。

可以看到，加锁成功要同时满足两个条件（_简述：如果有超过半数的 Redis 节点成功的获取到了锁，并且总耗时没有超过锁的有效时间，那么就是加锁成功_）：

- 条件一：客户端从超过半数（大于等于 N/2+1）的 Redis 节点上成功获取到了锁；
- 条件二：客户端从大多数节点获取锁的总耗时（t2-t1）小于锁设置的过期时间。

加锁成功后，客户端需要重新计算这把锁的有效时间，计算的结果是「锁最初设置的过期时间」减去「客户端从大多数节点获取锁的总耗时（t2-t1）」。如果计算的结果已经来不及完成共享数据的操作了，我们可以释放锁，以免出现还没完成数据操作，锁就过期了的情况。
加锁失败后，客户端向**所有 Redis 节点发起释放锁的操作**，释放锁的操作和在单节点上释放锁的操作一样，只要执行释放锁的 Lua 脚本就可以了。
<a name="VbMOY"></a>

# 计算机网络

<a name="kXq3D"></a>

## 计算机网络的各层协议及作用？

计算机网络体系可以分为三种：

1. OSI七层模型
2. TCP/IP四层模型
3. 五层模型

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1711119072985-bd4e7d0b-95bb-41ab-926b-0dcc7dbc09c8.png#averageHue=%23e7e7e7&clientId=u1ee109d9-61a1-4&from=paste&height=673&id=ua59b3841&originHeight=673&originWidth=1215&originalType=binary&ratio=1&rotation=0&showTitle=false&size=339315&status=done&style=none&taskId=u385db74c-cba3-48cb-82e8-ed7cc57b45f&title=&width=1215)

TCP/IP模型总共有四层分别是

1. 应用层：专注于为用户提供应用的功能。如：HTTP，FTP，SMTP等。
2. 传输层：**负责端到端的通信**应用层的数据包会传给传输层，传输层为应用层提供网络支持。给数据添加TCP头部。
3. 网络层：**负责网络包的封装、分片、路由、转发，**在应用间数据传输的媒介，帮助应用到应用的通信，实际的传输功能由网络层提供。在TCP数据上添加IP头部。
4. 网络接口层：**负责网络包在物理网络中的传输**，在IP头部前面加上MAC头部，并封装成数据帧，发送到网络上。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709359684846-12f4ce20-f49d-4a01-93fe-f48d87109afb.png#averageHue=%23e2e3cb&clientId=uc2325c82-c100-4&from=paste&height=442&id=ca74B&originHeight=553&originWidth=959&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=126985&status=done&style=none&taskId=ub4b9395b-6469-4fcd-9d19-29b15475e16&title=&width=767.2)

**注意：**
网络接口层的传输单位是 数据帧（frame）
IP层的传输代为是 包（package）
TCP的层的传输单位是 段（segment）
HTTP的传输单位是消息或报文（message）
但这些名词并没有什么本质的区分，可以统称为数据包。

MSS
**MTU： 1500字节**

一个HTTP请求报文由四个部分组成：**请求行、请求头部、空行、请求数据。**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1711013268777-edcb10b3-2bb5-4dcd-96ce-515f92f2e1f0.png#averageHue=%23f1f1f4&clientId=ucc0495bc-0f4f-4&from=paste&id=u656086da&originHeight=891&originWidth=1166&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=382120&status=done&style=none&taskId=u67656368-70cd-470c-a414-2dc73bf6131&title=)
常见的HTTP状态码
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710312189616-3e19aa24-30c8-4497-abf9-a8dee673c5af.png#averageHue=%23e6e6d9&clientId=ue288f9df-c806-4&from=paste&height=294&id=ubf04b14f&originHeight=368&originWidth=1080&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=215069&status=done&style=none&taskId=ud68706f9-0a42-430a-8450-6755b090eba&title=&width=864)

<a name="PIVLs"></a>

## TCP和UDP的区别

**对比如下：**

| 


| UDP          | TCP                                        |                                                  |
| ------------ | ------------------------------------------ | ------------------------------------------------ |
| 是否连接     | 无连接                                     | 面向连接                                         |
| 是否可靠     | 不可靠传输，不使用流量控制和拥塞控制       | 可靠传输，使用流量控制和拥塞控制                 |
| 是否有序     | 无序                                       | 有序，消息在传输过程中可能会乱序，TCP 会重新排序 |
| 传输速度     | 快                                         | 慢                                               |
| 连接对象个数 | 支持一对一，一对多，多对一和多对多交互通信 | 只能是一对一通信                                 |
| 传输方式     | 面向报文                                   | 面向字节流                                       |
| 首部开销     | 首部开销小，仅8字节                        | 首部最小20字节，最大60字节                       |
| 适用场景     | 适用于实时应用（IP电话、视频会议、直播等） | 适用于要求可靠传输的应用，例如文件传输           |

**总结**：
**TCP 用于在传输层有必要实现可靠传输的情况，UDP 用于对高速传输和实时性有较高要求的通信。TCP 和 UDP 应该根据应用目的按需使用。**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1711119372432-43baf6c0-d46b-4423-87b1-6b3319a45d6e.png#averageHue=%23e6e6e6&clientId=u1ee109d9-61a1-4&from=paste&height=767&id=u6d954f8a&originHeight=767&originWidth=944&originalType=binary&ratio=1&rotation=0&showTitle=false&size=231536&status=done&style=none&taskId=ub71414d0-0326-4282-9154-7c476a213f6&title=&width=944)

<a name="GoBQC"></a>

## 什么事SYN洪泛攻击？如何防范？

SYN洪泛攻击属于 DOS 攻击的一种，它利用 TCP 协议缺陷，通过发送大量的半连接请求，耗费 CPU 和内存资源。
原理：

- 在三次握手过程中，服务器发送 `[SYN/ACK]` 包（第二个包）之后、收到客户端的 `[ACK]` 包（第三个包）之前的 TCP 连接称为半连接（half-open connect），此时服务器处于 `SYN_RECV`（等待客户端响应）状态。如果接收到客户端的 `[ACK]`，则 TCP 连接成功，如果未接受到，则会**不断重发请求**直至成功。
- SYN 攻击的攻击者在短时间内**伪造大量不存在的 IP 地址**，向服务器不断地发送 `[SYN]` 包，服务器回复 `[SYN/ACK]` 包，并等待客户的确认。由于源地址是不存在的，服务器需要不断的重发直至超时。
- 这些伪造的 `[SYN]` 包将长时间占用未连接队列，影响了正常的 SYN，导致目标系统运行缓慢、网络堵塞甚至系统瘫痪。

检测：当在服务器上看到大量的半连接状态时，特别是源 IP 地址是随机的，基本上可以断定这是一次 SYN 攻击。
防范：

- 通过防火墙、路由器等过滤网关防护。
- 通过加固 TCP/IP 协议栈防范，如增加最大半连接数，缩短超时时间。
- SYN cookies技术。SYN Cookies 是对 TCP 服务器端的三次握手做一些修改，专门用来防范 SYN 洪泛攻击的一种手段。

<a name="jKVI6"></a>

## TCP协议如何保证可靠性？

TCP主要提供了**检验和**、**序列号**/**确认应答**、**超时重传**、**滑动窗口**、**拥塞控制**和 **流量控制**等方法实现了可靠性传输。

- 检验和：通过检验和的方式，接收端可以检测出来数据是否有差错和异常，假如有差错就会直接丢弃TCP段，重新发送。
- 序列号/确认应答：
  序列号的作用不仅仅是应答的作用，有了序列号能够将接收到的数据根据序列号排序，并且去掉重复序列号的数据。
  TCP传输的过程中，每次接收方收到数据后，都会对传输方进行确认应答。也就是发送ACK报文，这个ACK报文当中带有对应的确认序列号，告诉发送方，接收到了哪些数据，下一次的数据从哪里发。
- 滑动窗口：滑动窗口既提高了报文传输的效率，也避免了发送方发送过多的数据而导致接收方无法正常处理的异常。
- 超时重传：超时重传是指发送出去的数据包到接收到确认包之间的时间，如果超过了这个时间会被认为是丢包了，需要重传。最大超时时间是动态计算的。
- 拥塞控制：在数据传输过程中，可能由于网络状态的问题，造成网络拥堵，此时引入拥塞控制机制，在保证TCP可靠性的同时，提高性能。
- 流量控制：如果主机A 一直向主机B发送数据，不考虑主机B的接受能力，则可能导致主机B的接受缓冲区满了而无法再接受数据，从而会导致大量的数据丢包，引发重传机制。而在重传的过程中，若主机B的接收缓冲区情况仍未好转，则会将大量的时间浪费在重传数据上，降低传送数据的效率。所以引入流量控制机制，主机B通过告诉主机A自己接收缓冲区的大小，来使主机A控制发送的数据量。流量控制与TCP协议报头中的窗口大小有关。

<a name="I0r1a"></a>

## HTTP常见的状态码有哪些？

常见状态码：

- 200：服务器已成功处理了请求。 通常，这表示服务器提供了请求的网页。
- 301 ： (永久移动) 请求的网页已永久移动到新位置。 服务器返回此响应(对 GET 或 HEAD 请求的响应)时，会自动将请求者转到新位置。
- 302：(临时移动) 服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求。
- 400 ：客户端请求有语法错误，不能被服务器所理解。
- 403 ：服务器收到请求，但是拒绝提供服务。
- 404 ：(未找到) 服务器找不到请求的网页。
- 500： (服务器内部错误) 服务器遇到错误，无法完成请求。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1711119942082-fd615d57-8ba3-4c76-ae4f-0886a7a90d1a.png#averageHue=%23e4e8e7&clientId=u1ee109d9-61a1-4&from=paste&height=394&id=u31149953&originHeight=394&originWidth=1216&originalType=binary&ratio=1&rotation=0&showTitle=false&size=394590&status=done&style=none&taskId=ua417ea28-e883-451b-bd17-b20835fdc96&title=&width=1216)

<a name="uX5lu"></a>

## 状态码301和302的区别是什么？

**共同点**：301和302状态码都表示重定向，就是说浏览器在拿到服务器返回的这个状态码后会自动跳转到一个新的URL地址，这个地址可以从响应的**Location**首部中获取（**用户看到的效果就是他输入的地址A瞬间变成了另一个地址B**）。
**不同点**：301表示旧地址A的资源已经被永久地移除了(这个资源不可访问了)，搜索引擎在抓取新内容的同时也将旧的网址交换为重定向之后的网址；302表示旧地址A的资源还在（仍然可以访问），这个重定向只是临时地从旧地址A跳转到地址B，搜索引擎会抓取新的内容而保存旧的网址。 SEO中302好于301。
**补充，重定向原因**：

1. 网站调整（如改变网页目录结构）；
2. 网页被移到一个新地址；
3. 网页扩展名改变(如应用需要把.php改成.Html或.shtml)。

<a name="ywRld"></a>

## GET请求和POST请求的区别？

**使用上的区别**：

- GET使用URL或Cookie传参，而POST将数据放在BODY中”，这个是因为HTTP协议用法的约定。
- GET方式提交的数据有长度限制，则POST的数据则可以非常大”，这个是因为它们使用的操作系统和浏览器设置的不同引起的区别。
- POST比GET安全，因为数据在地址栏上不可见”，这个说法没毛病，但依然不是GET和POST本身的区别。

**本质区别**
GET和POST最大的区别主要是GET请求是幂等性的，POST请求不是。这个是它们本质区别。
幂等性是指一次和多次请求某一个资源应该具有同样的副作用。简单来说意味着对同一URL的多个请求应该返回同样的结果。

<a name="Gf5zB"></a>

## 解释一下HTTP长连接和短链接？

**在HTTP/1.0中，默认使用的是短连接**。也就是说，浏览器和服务器每进行一次HTTP操作，就建立一次连接，但任务结束就中断连接。如果客户端浏览器访问的某个HTML或其他类型的 Web页中包含有其他的Web资源，如JavaScript文件、图像文件、CSS文件等；当浏览器每遇到这样一个Web资源，就会建立一个HTTP会话。
但从 **HTTP/1.1起，默认使用长连接**，用以保持连接特性。使用长连接的HTTP协议，会在**响应头**有加入这行代码：`_Connection:keep-alive_`
在使用长连接的情况下，当一个网页打开完成后，客户端和服务器之间用于传输HTTP数据的 TCP连接不会关闭，如果客户端再次访问这个服务器上的网页，会继续使用这一条已经建立的连接。Keep-Alive不会永久保持连接，它有一个保持时间，可以在不同的服务器软件（如Apache）中设定这个时间。实现长连接要客户端和服务端都支持长连接。
**HTTP协议的长连接和短连接，实质上是TCP协议的长连接和短连接**。

<a name="tspF3"></a>

## HTTP请求报文和响应报文的格式?

**请求报文格式：**

1. 请求行（请求方法+URL协议+版本）
2. 请求头部
3. 空行
4. 请求主体

```
GET/sample.jspHTTP/1.1 请求行
Accept:image/gif.image/jpeg, 请求头部
Accept-Language:zh-cn
Connection:Keep-Alive
Host:localhost
User-Agent:Mozila/4.0(compatible;MSIE5.01;Window NT5.0)
Accept-Encoding:gzip,deflate
```

响应报文：

1. 状态行（版本+状态码+原因短句）
2. 响应首部
3. 空行
4. 响应主体

```html
HTTP/1.1 200 OK
Server:Apache Tomcat/5.0.12
Date:Mon,6Oct2003 13:23:42 GMT
Content-Length:112

<html>
  <head>
    <title>HTTP响应示例<title>
  </head>
      <body>
        Hello HTTP!
      </body>
</html>
```

<a name="e4tMH"></a>

## 介绍一下HTTP缓存

HTTP缓存有2种实现方式：

1. 强制缓存：浏览器判断缓存没有过期，直接使用浏览器本地的缓存，主动性在浏览器这边。
2. 协商缓存：Etag, If-None-Match   If-Modfield-Since, Last-Modfield字段来实现的

强制缓存：
强缓存是利用下面这两个 HTTP 响应头部（Response Header）字段实现的，它们都用来表示资源在客户端缓存的有效期：

- Cache-Control， 是一个相对时间；
- Expires，是一个绝对时间；

协商缓存：
第一种：请求头部中的 If-Modified-Since 字段与响应头部中的 Last-Modified 字段实现，这两个字段的意思是：

- 响应头部中的 Last-Modified：标示这个响应资源的最后修改时间；
- 请求头部中的 If-Modified-Since：当资源过期了，发现响应头中具有 Last-Modified 声明，则再次发起请求的时候带上 Last-Modified 的时间，服务器收到请求后发现有 If-Modified-Since 则与被请求资源的最后修改时间进行对比（Last-Modified），如果最后修改时间较新（大），说明资源又被改过，则返回最新资源，HTTP 200 OK；如果最后修改时间较旧（小），说明资源无新修改，响应 HTTP 304 走缓存。

第二种：请求头部中的 If-None-Match 字段与响应头部中的 ETag 字段，这两个字段的意思是：

- 响应头部中 Etag：唯一标识响应资源；
- 请求头部中的 If-None-Match：当资源过期时，浏览器发现响应头里有 Etag，则再次向服务器发起请求时，会将请求头 If-None-Match 值设置为 Etag 的值。服务器收到请求后进行比对，如果资源没有变化返回 304，如果资源变化了返回 200。
  <a name="P6YHD"></a>

## HTTP/1.1如何优化

1. 尽量避免发送HTTP请求：通过缓存技术。
2. 减少HTTP请求次数：减少重定向请求，合并请求，延迟发送请求。
3. 减少HTTP响应的数据大小：无损压缩，有损压缩。

**重定向请求交给代理服务器**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709683535009-1a2e371d-4af0-47fe-8a49-fa0226708081.png#averageHue=%23fafaf9&clientId=u631518c2-9940-4&from=paste&height=646&id=u0ed5d253&originHeight=808&originWidth=1110&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=174381&status=done&style=none&taskId=u5aea53f6-1383-4e7a-ae5d-32e68629f92&title=&width=888)

代理服务器知晓了重定向规则后，
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709683597546-0ca9c2df-c65d-4c92-8efa-ac815d1f2ae5.png#averageHue=%23fafafa&clientId=u631518c2-9940-4&from=paste&height=500&id=u799c489c&originHeight=625&originWidth=1001&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=120138&status=done&style=none&taskId=ufa34d222-8a39-4125-b043-b320e711732&title=&width=800.8)

**合并请求：**
把多个访问小文件的请求合并成一个大的请求，虽然传输的总资源还是一样，但是减少请求，也就意味着**减少了重复发送的 HTTP 头部**。
**通过将多个小图片合并成一个大图片来减少 HTTP 请求的次数，以减少 HTTP 请求的次数，从而减少网络的开销**。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709683760102-dc5439e7-553c-4e3f-a4e5-c6c3d27d91b2.png#averageHue=%23faf9f9&clientId=u631518c2-9940-4&from=paste&height=342&id=ub768e1ab&originHeight=428&originWidth=1009&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=98792&status=done&style=none&taskId=u04badb64-fcb0-494f-9b30-1113323e5d0&title=&width=807.2)
还可以将图片的二进制数据用 base64 编码后，以 URL 的形式嵌入到 HTML 文件，跟随 HTML 文件一并发送.

```html
<image src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAFKCAIAAAC7M9WrAAAACXBIWXMAA ... />
```

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709683905713-37d8bb5d-c694-4cb9-a96e-541cfa104146.png#averageHue=%23f4d6b4&clientId=u631518c2-9940-4&from=paste&height=411&id=u450c864b&originHeight=514&originWidth=1010&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=147954&status=done&style=none&taskId=u5907c8dc-8378-4a83-a76c-04d031842ef&title=&width=808)
**合并请求的方式就是合并资源，以一个大资源的请求替换多个小资源的请求**。
但是这样的合并请求会带来新的问题，**当大资源中的某一个小资源发生变化后，客户端必须重新下载整个完整的大资源文件**，这显然带来了额外的网络消耗。

**延迟发送请求：**
一般 HTML 里会含有很多 HTTP 的 URL，当前不需要的资源，我们没必要也获取过来，于是可以通过「**按需获取**」的方式，来减少第一时间的 HTTP 请求次数。

如何减少HTTP响应的数据大小？
压缩：

1. 无损压缩
2. 有损压缩

**无损压缩**
gzip 就是比较常见的无损压缩。客户端支持的压缩算法，会在 HTTP 请求中通过头部中的 Accept-Encoding 字段告诉服务器：

```
Accept-Encoding: gzip, deflate, br
```

服务器收到后，会从中选择一个服务器支持的或者合适的压缩算法，然后使用此压缩算法对响应资源进行压缩，最后通过响应头部中的 Content-Encoding 字段告诉客户端该资源使用的压缩算法。

```
Content-Encoding: gzip
```

gzip 的压缩效率相比 Google 推出的 Brotli 算法还是差点意思，也就是上文中的 br，所以如果可以，服务器应该选择压缩效率更高的 br 压缩算法。

**有损压缩**
有损压缩主要将次要的数据舍弃，牺牲一些质量来减少数据量、提高压缩比，这种方法经常用于压缩多媒体数据，比如音频、视频、图片。
可以通过 HTTP 请求头部中的 Accept 字段里的「 q 质量因子」，告诉服务器期望的资源质量。

```
Accept: audio/*; q=0.2, audio/basic
```

<a name="OD5kZ"></a>

## HTTPS RSA握手解析过程？

RSA官方介绍

> RSA加密算法是一种**非对称加密算法**。

握手过程
1.客户端提交https请求
2.服务器响应客户,并把服务器公钥发给客户端
3.客户端验证公钥的有效性
4.有效后，客户端会生成一个会话密钥(一个随机数)
5.用服务器公钥加密这个会话密钥后，发送给服务器
6.服务器收到公钥加密的密钥后，用私钥解密，获取会话密钥
7.客户端与服务器利用**会话密钥**对传输数据进行**对称加密通信**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710049647380-f8aa0009-1ddd-4c56-8046-f2f292554d15.png#averageHue=%23d7dace&clientId=u9db7e599-f377-4&from=paste&id=ue22430e6&originHeight=723&originWidth=630&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=220932&status=done&style=none&taskId=u8874e9db-91db-47cf-b579-7b8f71a38c8&title=)

客户端如何检查公钥是否合法？

客户端拿着服务器发来的公钥再发请求去CA那做检验？
客户端其实需要预置CA签发的根证书，这个根证书中保存了CA的公钥。
而且在之前的第2步中，服务器发的并不是服务器公钥，而是由CA签发的服务器证书，这个证书包括了两部分：用CA私钥对服务器公钥以及其他网站信息加密后得到的的密文+对服务器公钥hash后的摘要。
**服务器将证书发给客户端以后，客户端从CA根证书中获取CA公钥，对服务器证书的密文进行解密，得到服务器公钥(当然还有网站的其他信息，这里先忽略)，然后再hash一次公钥，比较得到的结果和证书携带的摘要是否一致。**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710050886931-b44be309-ac2f-4ac2-b609-c2c0377ec2bd.png#averageHue=%23f0f0f0&clientId=u9db7e599-f377-4&from=paste&id=u910fc649&originHeight=630&originWidth=1200&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=362328&status=done&style=none&taskId=uab36c9f3-6cbe-46f8-af1f-8e152e59ad1&title=)

<a name="aLDZc"></a>

## HTTP/1.0 ，HTTP/1.1 HTTP/2 HTTP/3

<a name="kKY3h"></a>

### HTTP/1.1

- **持久连接**：引入了持久连接（Keep-Alive），在一个TCP连接上可以执行多个HTTP请求，减少了建立新连接的开销。
- **缓存控制**：增强了缓存机制，提供了更精细的缓存控制指令，如Cache-Control头部字段。
- **管道化**（ Pipelining）：虽然实际应用中存在限制，HTTP/1.1允许在一个连接上连续发送多个请求，不过响应仍然按照请求顺序返回。
  <a name="RhgPw"></a>

### HTTP/2

- **多路复用**（Multiplexing）：同一连接上可以并行处理多个请求和响应，避免了HTTP/1.x中的“队头阻塞”问题，极大地提高了页面加载速度。
- **二进制分帧**：将HTTP消息分解为二进制帧，使得不同类型的资源可以在同一个TCP连接上交错传输。
- **头部压缩**：使用HPACK算法对头部进行压缩，减少不必要的带宽消耗。
- **服务器推送**：服务器能够预测客户端可能需要的资源，并提前将其推送给客户端。
  <a name="KUmBe"></a>

### HTTP/3

- **基于QUIC**：HTTP/3 是基于QUIC协议的，而QUIC运行在用户数据报协议（UDP）之上，解决了TCP的某些延迟问题。
- **更快的连接建立**：QUIC实现了0-RTT（零往返时间）连接重用，即在已有连接上下文中快速恢复会话，无需等待握手完成就可以开始数据传输。
- **多路复用增强**：继承了HTTP/2的多路复用特性，但在传输层更加可靠，即使个别数据包丢失也能确保其他数据流不受影响。
- **安全性**：QUIC内置了加密功能，所有传输数据都在TLS保护下，提供更安全的传输保障。
- **拥塞控制优化**：QUIC包含了改进的拥塞控制算法，能更好地应对网络状况的变化。

综上所述，每一代HTTP协议都在前一代的基础上针对性能瓶颈做了重大改进，HTTP/3特别针对网络延迟、连接效率和安全性方面做出了显著提升。
<a name="sJEfg"></a>

## 

<a name="NdWES"></a>

### HTTP和HTTPS的区别

- HTTP 是超文本传输协议，信息是明文传输，存在安全风险的问题。HTTPS 则解决 HTTP 不安全的缺陷，在 TCP 和 HTTP 网络层之间加入了 SSL/TLS 安全协议，使得报文能够加密传输。
- HTTP 连接建立相对简单， TCP 三次握手之后便可进行 HTTP 的报文传输。而 HTTPS 在 TCP 三次握手之后，还需进行 SSL/TLS 的握手过程，才可进入加密报文传输。
- 两者的默认端口不一样，HTTP 默认端口号是 80，HTTPS 默认端口号是 443。
- HTTPS 协议需要向 CA（证书权威机构）申请数字证书，来保证服务器的身份是可信的

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1711122449771-f4926d70-ce2b-4320-b4ab-0296536ed663.png#averageHue=%23575a58&clientId=u1ee109d9-61a1-4&from=paste&height=491&id=u41edc32e&originHeight=491&originWidth=1060&originalType=binary&ratio=1&rotation=0&showTitle=false&size=52069&status=done&style=none&taskId=u08fbfbe8-9047-47fd-9248-df4f5923d2c&title=&width=1060)

<a name="JzDSR"></a>

### HTTP1.0和HTTP1.1的区别？

- **长连接：**HTTP 1.1支持长连接（Persistent Connection）和请求的流水线（Pipelining）处理，在一个TCP连接上可以传送多个HTTP请求和响应，减少了建立和关闭连接的消耗和延迟，在HTTP1.1中默认开启`Connection： keep-alive`，一定程度上弥补了HTTP1.0每次请求都要创建连接的缺点。
- **缓存处理：**在HTTP1.0中主要使用header里的If-Modified-Since,Expires来做为缓存判断的标准，HTTP1.1则引入了更多的缓存控制策略，可供选择的缓存头来控制缓存策略。
- **贷款优化以及网络连接的使用：**HTTP1.0中，存在一些浪费带宽的现象，例如客户端只是需要某个对象的一部分，而服务器却将整个对象送过来了，并且不支持断点续传功能，HTTP1.1则在请求头引入了range头域，它允许只请求资源的某个部分，即返回码是206（Partial Content），这样就方便了开发者自由的选择以便于充分利用带宽和连接。
- **错误通知的管理：**在HTTP1.1中新增了24个错误状态响应码，如409（Conflict）表示请求的资源与资源的当前状态发生冲突；410（Gone）表示服务器上的某个资源被永久性的删除。
- **Host头处理：**在HTTP1.0中认为每台服务器都绑定一个唯一的IP地址，因此，请求消息中的URL并没有传递主机名（hostname）。但随着虚拟主机技术的发展，在一台物理服务器上可以存在多个虚拟主机（Multi-homed Web Servers），并且它们共享一个IP地址。HTTP1.1的请求消息和响应消息都应支持Host头域，且请求消息中如果没有Host头域会报告一个错误（400 Bad Request）。

<a name="TXtsT"></a>

### HTTP1.1和HTTP2.0的区别？

HTTP2.0相比HTTP1.1支持的特性：

- **新的二进制格式**：HTTP1.1的解析是基于文本。基于文本协议的格式解析存在天然缺陷，文本的表现形式有多样性，要做到健壮性考虑的场景必然很多，二进制则不同，只认0和1的组合。基于这种考虑HTTP2.0的协议解析决定采用二进制格式，实现方便且健壮。
- **多路复用**，即连接共享，即每一个request都是用作连接共享机制的。一个request对应一个id，这样一个连接上可以有多个request，每个连接的request可以随机的混杂在一起，接收方可以根据request的 id将request再归属到各自不同的服务端请求里面。
- **头部压缩**，HTTP1.1的头部（header）带有大量信息，而且每次都要重复发送；HTTP2.0使用encoder来减少需要传输的header大小，通讯双方各自cache一份header fields表，既避免了重复header的传输，又减小了需要传输的大小。
- **服务端推送**：服务器除了对最初请求的响应外，服务器还可以额外的向客户端推送资源，而无需客户端明确的请求。

<a name="jQN2A"></a>

### HTTPS解决了HTTP的哪些问题？

- **窃听风险**，比如通信链路上可以获取通信内容，用户号容易没。
- **篡改风险**，比如强制植入垃圾广告，视觉污染，用户眼容易瞎。
- **冒充风险**，比如冒充淘宝网站，用户钱容易没。

HTTP**S** 在 HTTP 与 TCP 层之间加入了 SSL/TLS 协议，可以很好的解决了上述的风险：

- **信息加密**：交互信息无法被窃取，但你的号会因为「自身忘记」账号而没。
- **校验机制**：无法篡改通信内容，篡改了就不能正常显示，但百度「竞价排名」依然可以搜索垃圾广告。
- **身份证书**：证明淘宝是真的淘宝网，但你的钱还是会因为「剁手」而没。

HTTPS 是如何解决上面的三个风险的？

- **混合加密**的方式实现信息的**机密性**，解决了窃听的风险。
- **摘要算法**的方式来实现**完整性**，它能够为数据生成独一无二的「指纹」，指纹用于校验数据的完整性，解决了篡改的风险。
- 将服务器公钥放入到**数字证书**中，解决了冒充的风险。

那 HTTP/2 相比 HTTP/1.1 性能上的改进：

- **头部压缩**
- **二进制格式**
- **并发传输**
- **服务器主动推送资源**

HTTP/2有什么缺陷？
**对头阻塞问题，**只不过问题不是在 HTTP 这一层面，而是在 TCP 这一层。
**HTTP/2 是基于 TCP 协议来传输数据的，TCP 是字节流协议，TCP 层必须保证收到的字节数据是完整且连续的，这样内核才会将缓冲区里的数据返回给 HTTP 应用，那么当「前 1 个字节数据」没有到达时，后收到的字节数据只能存放在内核缓冲区里，只有等到这 1 个字节数据到达时，HTTP/2 应用层才能从内核中拿到数据，这就是 HTTP/2 队头阻塞问题。**

**HTTP/3 优化**
前面我们知道了 HTTP/1.1 和 HTTP/2 都有队头阻塞的问题：

- HTTP/1.1 中的管道（ pipeline）虽然解决了请求的队头阻塞，但是**没有解决响应的队头阻塞**，因为服务端需要按顺序响应收到的请求，如果服务端处理某个请求消耗的时间比较长，那么只能等响应完这个请求后， 才能处理下一个请求，这属于 **HTTP 层队头阻塞。**
- HTTP/2 虽然通过多个请求复用一个 TCP 连接解决了 HTTP 的队头阻塞 ，但是**一旦发生丢包，就会阻塞住所有的 HTTP 请求**，这属于 **TCP 层队头阻塞。**

HTTP/2 队头阻塞的问题是因为 TCP，所以 **HTTP/3 把 HTTP 下层的 TCP 协议改成了 UDP！**

![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710052164831-134c9b1a-94e9-4430-bb26-584a370b5195.jpeg#averageHue=%23d5d9a0&clientId=u9db7e599-f377-4&from=paste&id=ud5f6570a&originHeight=366&originWidth=782&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u852f3ccc-ac83-487c-9f01-d39cd034311&title=)

UDP 发送是不管顺序，也不管丢包的，所以不会出现像 HTTP/2 队头阻塞的问题。大家都知道 UDP 是不可靠传输的，但基于 UDP 的 **QUIC 协议** 可以实现类似 TCP 的可靠性传输。
QUIC 有以下 3 个特点。

- 无队头阻塞
- 更快的连接建立
- 连接迁移

QUIC 有自己的一套机制可以保证传输的可靠性的。**当某个流发生丢包时，只会阻塞这个流，其他流不会受到影响，因此不存在队头阻塞问题**。这与 HTTP/2 不同，HTTP/2 只要某个流中的数据包丢失了，其他流也会因此受影响。

![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710052528175-5112afb2-38e5-4a3a-9c63-a9aa2c9169ad.jpeg#averageHue=%23f0e9d3&clientId=u9db7e599-f377-4&from=paste&id=ub9538433&originHeight=492&originWidth=742&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u51e4c01b-a9f8-456c-b746-a8fa099179e&title=)
所以， QUIC 是一个在 UDP 之上的**伪** TCP + TLS + HTTP/2 的多路复用的协议。

<a name="aVap8"></a>

## 谈一谈网址到页面显示，期间发生了什么？

过程：

1. 浏览器对  URL 进行解析，生成发送给服务器的 请求信息
2. 通过DNS查询服务器的域名对应的IP地址。DNS查找过程：本地DNS服务器 => 根域名服务器www. => 顶级域名.com => 查找到www.server.com的DNS服务器 => 返回www.server.com的IP地址
3. 经过TCP连接： 给数据添加TCP头部，IP头部，MAC地址
4. 通过网卡 => 发送HTTP请求
5. 在网络中传输 经过 交换机和路由器 找到 将请求发送到服务器
6. 服务器响应请求，返回数据
7. 浏览器进行页面渲染

**在浏览器中输入www.baidu.com后执行的全部过程？**

- 域名解析（域名 [www.baidu.com ](http://www.baidu.com/)变为 ip 地址）。
  **浏览器搜索自己的DNS缓存**（维护一张域名与IP的对应表）；若没有，则搜索**操作系统的DNS缓存**（维护一张域名与IP的对应表）；若没有，则搜索操作系统的**hosts文件**（维护一张域名与IP的对应表）。
  若都没有，则找 tcp/ip 参数中设置的首选 dns 服务器，即**本地 dns 服务器**（递归查询），**本地域名服务器查询自己的dns缓存**，如果没有，则进行迭代查询。将本地dns服务器将IP返回给操作系统，同时缓存IP。
- 发起 tcp 的三次握手，建立 tcp 连接。浏览器会以一个随机端口（1024-65535）向服务端的 web 程序 **80** 端口发起 tcp 的连接。
- 建立 tcp 连接后发起 http 请求。
- 服务器响应 http 请求，客户端得到 html 代码。服务器 web 应用程序收到 http 请求后，就开始处理请求，处理之后就返回给浏览器 html 文件。
- 浏览器解析 html 代码，并请求 html 中的资源。
- 浏览器对页面进行渲染，并呈现给用户。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1711122586265-7bc6b184-1fa9-4087-8ea1-def7dd36bd57.png#averageHue=%23bad7e1&clientId=u1ee109d9-61a1-4&from=paste&id=u1e4dc4b5&originHeight=1193&originWidth=841&originalType=url&ratio=1&rotation=0&showTitle=false&size=596925&status=done&style=none&taskId=u2a0a75a4-7328-4b29-8210-d249e5a5e2e&title=)
<a name="Nd4nG"></a>

## GET 与 POST 的区别

**GET的语义**：从服务器获取指定的资源
**POST的语义**：根据请求负载（报文body）对指定的资源做出处理

按照语义来说
GET请求是 安全且等幂的。
POST请求不是安全的也不是等幂的。

<a name="NvtJc"></a>

## 谈谈HTTP和HTTPS有区别

1. HTTP是超文本传输协议，信息的传输时明文传输的，存在风险，HTTPS解决了不完全的缺陷，主要时在TCP和HTTP网络层之间增加了一个SSL/TLS的安全协议，使得报文能够加密传输。
2. HTTP建立连接相对比较简单，通过TCP的三次握手就行； 而HTTPS在三次握手基础上还多了一个。SSL/TSL的握手过程，才能进行加密传输。
3. 两个的默认端口也不同，HTTP默认时80端口，HTTPS默认时443端口。
4. HTTPS还要向CA（证书权威机构）申请数字证书，来确认服务器的身份是可信的。

<a name="xXwwd"></a>

## 什么是Cookie和Session？

**什么是 Cookie**
HTTP Cookie（也叫 Web Cookie或浏览器 Cookie）是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向同一服务器再发起请求时被携带并发送到服务器上。通常，它用于告知服务端两个请求是否来自同一浏览器，如保持用户的登录状态**。Cookie 使基于无状态的 HTTP 协议记录稳定的状态信息成为了可能。**
Cookie 主要用于以下三个方面：

- 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
- 个性化设置（如用户自定义设置、主题等）
- 浏览器行为跟踪（如跟踪分析用户行为等）

**什么是 Session**
Session 代表着服务器和客户端一次会话的过程。Session 对象存储特定用户会话所需的属性及配置信息。这样，当用户在应用程序的 Web 页之间跳转时，存储在 Session 对象中的变量将不会丢失，而是在整个用户会话中一直存在下去。当客户端关闭会话，或者 Session 超时失效时会话结束。

<a name="vkIOW"></a>

## Cookie和Session是何如配合的呢？

用户第一次请求服务器的时候，服务器根据用户提交的相关信息，创建对应的 Session ，请求返回时将此 Session 的唯一标识信息 SessionID 返回给浏览器，浏览器接收到服务器返回的 SessionID 信息后，会将此信息存入到 Cookie 中，同时 Cookie 记录此 SessionID 属于哪个域名。
当用户第二次访问服务器的时候，请求会自动判断此域名下是否存在 Cookie 信息，如果存在自动将 Cookie 信息也发送给服务端，服务端会从 Cookie 中获取 SessionID，再根据 SessionID 查找对应的 Session 信息，如果没有找到说明用户没有登录或者登录失效，如果找到 Session 证明用户已经登录可执行后面操作。
根据以上流程可知，SessionID 是连接 Cookie 和 Session 的一道桥梁，大部分系统也是根据此原理来验证用户登录状态。

<a name="Tzkb7"></a>

## Cookie和Session的区别？

- 作用范围不同，Cookie 保存在客户端（浏览器），Session 保存在服务器端。
- 存取方式的不同，Cookie 只能保存 ASCII，Session 可以存任意数据类型，一般情况下我们可以在 Session 中保持一些常用变量信息，比如说 UserId 等。
- 有效期不同，Cookie 可设置为长时间保持，比如我们经常使用的默认登录功能，Session 一般失效时间较短，客户端关闭或者 Session 超时都会失效。
- 隐私策略不同，Cookie 存储在客户端，比较容易遭到不法获取，早期有人将用户的登录名和密码存储在 Cookie 中导致信息被窃取；Session 存储在服务端，安全性相对 Cookie 要好一些。
- 存储大小不同， 单个 Cookie 保存的数据不能超过 4K，Session 可存储数据远高于 Cookie。

<a name="hsjCp"></a>

## 如何考虑吧分布式Session问题？

在互联网公司为了可以支撑更大的流量，后端往往需要多台服务器共同来支撑前端用户请求，那如果用户在 A 服务器登录了，第二次请求跑到服务 B 就会出现登录失效问题。
分布式 Session 一般会有以下几种解决方案：

- **客户端存储**：直接将信息存储在cookie中，cookie是存储在客户端上的一小段数据，客户端通过http协议和服务器进行cookie交互，通常用来存储一些不敏感信息
- **Nginx ip_hash 策略**：服务端使用 Nginx 代理，每个请求按访问 IP 的 hash 分配，这样来自同一 IP 固定访问一个后台服务器，避免了在服务器 A 创建 Session，第二次分发到服务器 B 的现象。
- **Session 复制**：任何一个服务器上的 Session 发生改变（增删改），该节点会把这个 Session 的所有内容序列化，然后广播给所有其它节点。
- **共享 Session**：服务端无状态话，将用户的 Session 等信息使用缓存中间件（如Redis）来统一管理，保障分发到每一个服务器的响应结果都一致。

建议采用共享 Session的方案。

<a name="jM3jl"></a>

## 什么是DDos攻击？

DDos全称Distributed Denial of Service，分布式拒绝服务攻击。最基本的DOS攻击过程如下：

1. 客户端向服务端发送请求链接数据包。
2. 服务端向客户端发送确认数据包。
3. 客户端不向服务端发送确认数据包，服务器一直等待来自客户端的确认

DDoS则是采用分布式的方法，通过在网络上占领多台“肉鸡”，用多台计算机发起攻击。
DOS攻击现在基本没啥作用了，因为服务器的性能都很好，而且是多台服务器共同作用，1V1的模式黑客无法占上风。对于DDOS攻击，预防方法有：

- **减少SYN timeout时间**。在握手的第三步，服务器会等待30秒-120秒的时间，减少这个等待时间就能释放更多的资源。
- **限制同时打开的SYN半连接数目。**

<a name="hXU55"></a>

## 什么是XSS攻击？

XSS也称 cross-site scripting，**跨站脚本**。这种攻击是**由于服务器将攻击者存储的数据原原本本地显示给其他用户所致的**。比如一个存在XSS漏洞的论坛，用户发帖时就可以引入**带有＜script＞标签的代码**，导致恶意代码的执行。
预防措施有：

- 前端：过滤。
- 后端：转义，**比如go自带的处理器就具有转义功能。**

<a name="DRctw"></a>

## SQL注入是什么？如何避免？

SQL 注入就是在用户输入的字符串中加入 SQL 语句，如果在设计不良的程序中忽略了检查，那么这些注入进去的 SQL 语句就会被数据库服务器误认为是正常的 SQL 语句而运行，攻击者就可以执行计划外的命令或访问未被授权的数据。
**SQL注入的原理主要有以下 4 点**

- 恶意拼接查询
- 利用注释执行非法命令
- 传入非法参数
- 添加额外条件

**避免SQL注入的一些方法**：

- 限制数据库权限，给用户提供仅仅能够满足其工作的最低权限。
- 对进入数据库的特殊字符（’”\尖括号&*;等）转义处理。
- 提供参数化查询接口，不要直接使用原生SQL。

<a name="QtGH0"></a>

## 为什么又了HTTP协议，还有RPC协议

HTTP和RPC都是基于TCP协议上的。
RPC的话，叫做 远程服务调用
从发展上来说的话，HTTP主要使用在B/S架构，而RPC更多的话是用于C/S架构。
RPC出现是比HTTP要早的，且比目前主流的 HTTP/1.1 **性能**要更好，所以大部分公司内部都还在使用 RPC。

<a name="lEOxS"></a>

## 什么是TCP和TCP连接

TCP 是**面向连接的**，**可靠的**，**基于字节流**的传输层通信协议。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709362862376-3d0caad5-7348-4530-8666-55bc98b96312.png#averageHue=%23f6f79f&clientId=uc2325c82-c100-4&from=paste&height=160&id=SRH6L&originHeight=200&originWidth=568&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=52816&status=done&style=none&taskId=u1f881fe2-6b04-4554-b6ca-8621ebb65fa&title=&width=454.4)

**面向连接： **一定是【一对一】才能连接
**可靠的**：无论网络链路中出现什么情况，TCP都能够保证一个报文一定能够到达接收端。
**字节流**：通过TCP协议传输时，消息可能会被操作系统【分组】成多个TCP报文，如果接受方不知道【消息边界】，是无法读出一个有效的消息的。TCP报文时【有序的】，当一个TCP报文没有收到时，即使它先收到后面的TCP报文，那么也不能交给应用层处理，同时【重复】的TCP报文会自动丢弃。

TCP连接：用于保证可靠性和流量控制维护的某些信息。包括Socket，序列号，窗口大小称为连接。
建立一个 TCP 连接是需要客户端与服务端达成上述三个信息的共识。

- **Socket**：由 IP 地址和端口号组成
- **序列号**：用来解决乱序问题等
- **窗口大小**：用来做流量控制

<a name="QdeWO"></a>

## 为什么三次握手，四次挥手

**三次握手**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709462839600-29c2e4a9-9b9b-48a5-9706-404c1de44e99.png#averageHue=%23f9efd3&clientId=uc474559a-8b22-4&from=paste&height=643&id=NKUeS&originHeight=804&originWidth=1033&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=298458&status=done&style=none&taskId=u7cd7b7c7-bcab-4aab-ac8a-939db310c2b&title=&width=826.4)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708487536014-76964668-b672-4b09-8b86-777af7ee1f54.png#averageHue=%23d3eadc&clientId=u87a6036e-9e71-4&from=paste&height=524&id=fMrHA&originHeight=655&originWidth=1095&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=236640&status=done&style=none&taskId=u12f2a23e-78c2-4561-b7f5-1b40314275c&title=&width=876)
**以三个方面分析三次握手的原因：**

- 三次握手才可以阻止重复历史连接的初始化（主要原因）
- 三次握手才可以同步双方的初始序列号
- 三次握手才可以避免资源浪费

**客户端**
close
syn_sent
established

**服务器**
close
listen
syn_rcvd
established

两次握手只保证了一方的初始序列号能被对方成功接收，没办法保证双方的初始序列号都能被确认接收。

**四次挥手**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708487757441-d5ddedd1-1e6f-4cd8-9748-9ed3b124d724.png#averageHue=%23d3ead9&clientId=u87a6036e-9e71-4&from=paste&height=620&id=Z8V71&originHeight=775&originWidth=1277&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=385283&status=done&style=none&taskId=ud21cd58b-4b5a-4d6a-8ba1-fa2e9a4247e&title=&width=1021.6)
**第四次挥手要等2个MSL。**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709463083714-fb4c5e33-0a7c-4beb-a911-4f413c8d05e2.png#averageHue=%23f5e9d1&clientId=uc474559a-8b22-4&from=paste&height=787&id=nwTt5&originHeight=984&originWidth=994&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=323654&status=done&style=none&taskId=u7dfaac5a-002e-47c1-b58d-d7e4961f768&title=&width=795.2)

**客户端**
**established**
**发送 FIN**
**FIN_WAIT_1**
**收到ACK**
**FIN_WAIT_2**
**收到FIN**
**TIME_WAIT**
**经过2个MSL**
**CLOSE**

**服务器**
**established**
**收到FIN信号**
**发送ACK**
**CLOSE_WAIT**
**发送FIN**
**LAST_ACK**
**收到ACK**
**close**

**MSL： 报文最长生存时间。**

<a name="i6MSc"></a>

## 聊一聊TCP的重传机制

**超时重传**
RTT 指的是**数据发送时刻到接收到确认的时刻的差值**，也就是包的往返时间
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709364176531-5e5b2fc2-390d-4794-9163-e11cea0a3221.png#averageHue=%23faf8f4&clientId=uc2325c82-c100-4&from=paste&height=652&id=nck5F&originHeight=815&originWidth=958&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=199311&status=done&style=none&taskId=ub48f5822-6552-4bb8-b99e-40692f4b3ad&title=&width=766.4)
超时重传时间是以 RTO （Retransmission Timeout 超时重传时间）表示。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709364227619-13a734b3-b768-4f61-90df-8cc719b2b8b1.png#averageHue=%23faf4f1&clientId=uc2325c82-c100-4&from=paste&height=433&id=xQxab&originHeight=541&originWidth=961&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=181556&status=done&style=none&taskId=ub51f3b8f-2f57-4314-9380-b419538c554&title=&width=768.8)

超时重传的时间RTO略大于RTT

**快速重传**

快速重传的工作方式是当收到三个相同的 ACK 报文时，会在定时器过期之前，重传丢失的报文段。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709365125790-61cb15e2-5fce-4f8d-9a7b-6725751f4969.png#averageHue=%23f9f8f6&clientId=uc2325c82-c100-4&from=paste&height=579&id=ciOsT&originHeight=724&originWidth=1073&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=201355&status=done&style=none&taskId=u72c5263a-80be-49a2-ae92-2e06c44b528&title=&width=858.4)

**SACK（选择性确认）**
在TCP头部【选项】字段里面加一个 SACK 的东西，将 已收到的数据的信息发送给 【发送方】。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709365411804-80969bca-e65a-410f-aaa2-1e0652a44821.png#averageHue=%23fbfbfb&clientId=uc2325c82-c100-4&from=paste&height=457&id=UQpCF&originHeight=571&originWidth=1042&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=198901&status=done&style=none&taskId=ub6e65fa8-abcc-436d-9420-931a162101a&title=&width=833.6)

D-SACK

1. 可以让「发送方」知道，是发出去的包丢了，还是接收方回应的 ACK 包丢了;
2. 可以知道是不是「发送方」的数据包被网络延迟了;
3. 可以知道网络中是不是把「发送方」的数据包给复制了;

<a name="wSsHb"></a>

## 你知道滑动窗口吗？

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709365934409-e7dadc52-99f9-4982-bbff-0bd9b137e2ff.png#averageHue=%23faf7f6&clientId=uc2325c82-c100-4&from=paste&height=559&id=upI37&originHeight=699&originWidth=1009&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=270158&status=done&style=none&taskId=u6e6be0ff-d3cd-420c-bbe4-5d2f4d1b904&title=&width=807.2)
图中的 ACK 600 确认应答报文丢失，也没关系，因为可以通过下一个确认应答进行确认，只要发送方收到了 ACK 700 确认应答，就意味着 700 之前的所有数据「接收方」都收到了。这个模式就叫**累计确认**或者**累计应答**。

**swnd 发送窗口**
**rwnd 接收窗口**

<a name="Pl7wF"></a>

## TCP如何做的 流量控制和拥塞控制？

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709366930291-4bdcc0f8-5336-4395-84c9-e9f29ad2a00f.png#averageHue=%23f5f5f5&clientId=uc2325c82-c100-4&from=paste&height=643&id=XHsls&originHeight=804&originWidth=954&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=331586&status=done&style=none&taskId=ua7ff9bb7-d940-4a8b-ac2e-5738576697a&title=&width=763.2)

**拥塞窗口 cwnd**
拥塞窗口 cwnd 变化的规则：

- 只要网络中没有出现拥塞，cwnd 就会增大；
- 但网络中出现了拥塞，cwnd 就减少；

**拥塞控制主要是四个算法：**

- 慢启动
- 拥塞避免
- 拥塞发生
- 快速恢复

**慢启动**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709367182087-c0502802-d8a5-4d52-ab63-d02f9e414ebd.png#averageHue=%23fafafa&clientId=uc2325c82-c100-4&from=paste&height=534&id=qkTUp&originHeight=667&originWidth=1012&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=190421&status=done&style=none&taskId=ub78ca314-6991-4637-8f5b-47b4acdab83&title=&width=809.6)

那慢启动涨到什么时候是个头呢？
有一个叫慢启动门限 ssthresh （slow start threshold）状态变量。

- 当 cwnd < ssthresh 时，使用慢启动算法。
- 当 cwnd >= ssthresh 时，就会使用「拥塞避免算法」。

**拥塞避免算法**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709367332612-8f387917-779b-4ba1-9d08-fe5ff8fae930.png#averageHue=%23fbf9f7&clientId=uc2325c82-c100-4&from=paste&height=650&id=jvdAW&originHeight=812&originWidth=1083&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=179450&status=done&style=none&taskId=u6331e98e-ad48-4ef1-9122-d55cee895f5&title=&width=866.4)

**拥塞发生算法**

- 超时重传：ssthresh = cwmd/2， cwnd重置为1
- 快速重传：

**超时重传**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709367502034-4fcf6e04-6b92-4c27-81b1-b1d64869db8a.png#averageHue=%23faf7f6&clientId=uc2325c82-c100-4&from=paste&height=632&id=BeJRQ&originHeight=790&originWidth=1126&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=234900&status=done&style=none&taskId=u963450e0-2928-442c-b5a6-d9a59c70737&title=&width=900.8)
**快速重传**

- cwnd = cwnd/2
- ssthresh = cwnd

**快速恢复**
**cwnd = ssthresh + 3**

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709368816331-4010c712-e044-4e2c-8051-c9101efe8e7e.png#averageHue=%23f9f6f2&clientId=uc2325c82-c100-4&from=paste&height=512&id=ssH4M&originHeight=640&originWidth=1053&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=233112&status=done&style=none&taskId=uf93b63a5-5cac-4b96-87ec-956ca7430e7&title=&width=842.4)

<a name="LHSDK"></a>

## IP

<a name="vrlPj"></a>

### IP协议相关技术

<a name="zF77j"></a>

#### DNS 域名解析

DNS的功能：DNS可以将域名网站制动转换成IP地址。

域名的层级关系
例如： www.server.com
在域名中，**越靠右**的位置表示层级**越高**

根域名在最顶层，它的下一层就是com顶级域名，再下一层是 server.com
所以域名的层级关系类似一个树状的结构：

- 根DNS服务器
- 顶级域 DNS 服务器(com)
- 权威DNS 服务器（server.com）

<a name="z7tu7"></a>

#### DHCP 协议

DHCP在我们生活中十分常见，我们的电脑通常都是通过DHCP动态获取IP地址，大大省去了配置IP信息繁琐的过程。

<a name="uuAQg"></a>

#### NAT  网络地址转换NAT

NAT的话，是一种网络地址转换技术
提出NAT的元婴
IPv4的地址是非常紧缺的，NAT的提出，缓解了IPv4地址耗尽的问题。
简单的来说 NAT 就是同个公司、家庭、教室内的主机对外部通信时，把私有 IP 地址转换成公有 IP 地址。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710054634725-e2249f45-5dd2-451e-a931-c21e1abc3018.png#averageHue=%23f6f5f4&clientId=u9db7e599-f377-4&from=paste&id=nq6jC&originHeight=617&originWidth=1562&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u5c80cc0a-b289-4cf0-99e4-084563fec12&title=)

由于 NAT/NAPT 都依赖于自己的转换表，因此会有以下的问题：

- 外部无法主动与 NAT 内部服务器建立连接，因为 NAPT 转换表没有转换记录。
- 转换表的生成与转换操作都会产生性能开销。
- 通信过程中，如果 NAT 路由器重启了，所有的 TCP 连接都将被重置。

如何解决NAT潜在的问题？

1. IPv6
2. NAT穿透技术

<a name="hvTmZ"></a>

#### ICMP协议 互联网控制报文协议

ICMP 主要的功能包括：**确认 IP 包是否成功送达目标地址、报告发送过程中 IP 包被废弃的原因和改善网络设置等。**
ICMP 大致可以分为两大类：

- 一类是用于诊断的查询消息，也就是「**查询报文类型**」
- 另一类是通知出错原因的错误消息，也就是「**差错报文类型**」

<a name="wEgzW"></a>

## 聊一聊你对跨域的看法。CORS

> CORS是一个W3C标准，全称是"跨域资源共享"（Cross-origin resource sharing）。

CORS需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，IE浏览器不能低于IE10。
整个CORS通信过程，都是浏览器自动完成，不需要用户参与。对于开发者来说，CORS通信与同源的AJAX通信没有差别，代码完全一样。浏览器一旦发现AJAX请求跨源，就会自动添加一些附加的头信息，有时还会多出一次附加的请求，但用户不会有感觉。
因此，实现CORS通信的关键是服务器。只要服务器实现了CORS接口，就可以跨源通信。

**两种请求**
浏览器将CORS请求分成两类：简单请求（simple request）和非简单请求（not-so-simple request）。
只要同时满足以下两大条件，就属于简单请求。
（1) 请求方法是以下三种方法之一：

- HEAD
- GET
- POST

（2）HTTP的头信息不超出以下几种字段：

- Accept
- Accept-Language
- Content-Language
- Last-Event-ID
- Content-Type：只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain

这是为了兼容表单（form），因为历史上表单一直可以发出跨域请求。AJAX 的跨域设计就是，只要表单可以发，AJAX 就可以直接发。
凡是不同时满足上面两个条件，就属于非简单请求。
浏览器对这两种请求的处理，是不一样的。

<a name="vJcnB"></a>

### **简单请求**

对于简单请求，浏览器直接发出CORS请求。具体来说，就是在头信息之中，增加一个**Origin**字段。
下面是一个例子，浏览器发现这次跨源AJAX请求是简单请求，就自动在头信息之中，添加一个**Origin**字段。

```http
GET /cors HTTP/1.1
Origin: http://api.bob.com
Host: api.alice.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

上面的头信息中，Origin字段用来说明，本次请求来自哪个源（协议 + 域名 + 端口）。服务器根据这个值，决定是否同意这次请求。
如果Origin指定的源，不在许可范围内，服务器会返回一个正常的HTTP回应。浏览器发现，这个回应的头信息没有包含Access-Control-Allow-Origin字段（详见下文），就知道出错了，从而抛出一个错误，被XMLHttpRequest的onerror回调函数捕获。注意，这种错误无法通过状态码识别，因为HTTP回应的状态码有可能是200。
如果Origin指定的域名在许可范围内，服务器返回的响应，会多出几个头信息字段。

```http
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: FooBar
Content-Type: text/html; charset=utf-8
```

上面的头信息之中，有三个与CORS请求相关的字段，都以Access-Control-开头。
**（1）Access-Control-Allow-Origin**
该字段是必须的。它的值要么是请求时Origin字段的值，要么是一个*，表示接受任意域名的请求。
**（2）Access-Control-Allow-Credentials**
该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为true，如果服务器不要浏览器发送Cookie，删除该字段即可。
**（3）Access-Control-Expose-Headers**
该字段可选。CORS请求时，XMLHttpRequest对象的getResponseHeader()方法只能拿到6个基本字段：Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma。如果想拿到其他字段，就必须在Access-Control-Expose-Headers里面指定。上面的例子指定，getResponseHeader('FooBar')可以返回FooBar字段的值。

**withCredentials 属性**
上面说到，CORS请求默认不发送Cookie和HTTP认证信息。如果要把Cookie发到服务器，一方面要服务器同意，指定Access-Control-Allow-Credentials字段。

```http
Access-Control-Allow-Credentials: true
```

另一方面，开发者必须在AJAX请求中打开withCredentials属性。

```javascript
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```

否则，即使服务器同意发送Cookie，浏览器也不会发送。或者，服务器要求设置Cookie，浏览器也不会处理。
但是，如果省略withCredentials设置，有的浏览器还是会一起发送Cookie。这时，可以显式关闭withCredentials。

```javascript
xhr.withCredentials = false;
```

需要注意的是，如果要发送**Cookie，Access-Control-Allow-Origin就不能设为星号，必须指定明确的、与请求网页一致的域名。**同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传，且（跨源）原网页代码中的document.cookie也无法读取服务器域名下的Cookie。

<a name="apkze"></a>

### 非简单请求

<a name="GZdWN"></a>

#### 预检请求

非简单请求是那种对服务器有特殊要求的请求，比如请求方法是PUT或DELETE，或者Content-Type字段的类型是application/json。
非简单请求的CORS请求，会在正式通信之前，增加一次HTTP查询请求，称为"**预检"**请求（preflight）。
浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和头信息字段。只有得到肯定答复，浏览器才会发出正式的XMLHttpRequest请求，否则就报错。
下面是一段浏览器的JavaScript脚本。

```javascript
var url = 'http://api.alice.com/cors';
var xhr = new XMLHttpRequest();
xhr.open('PUT', url, true);
xhr.setRequestHeader('X-Custom-Header', 'value');
xhr.send();
```

上面代码中，HTTP请求的方法是PUT，并且发送一个自定义头信息X-Custom-Header。
浏览器发现，这是一个非简单请求，就自动发出一个"预检"请求，要求服务器确认可以这样请求。下面是这个"预检"请求的HTTP头信息。

```http
OPTIONS /cors HTTP/1.1
Origin: http://api.bob.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: X-Custom-Header
Host: api.alice.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

"预检"请求用的请求方法是OPTIONS，表示这个请求是用来询问的。头信息里面，关键字段是Origin，表示请求来自哪个源。
除了Origin字段，"预检"请求的头信息包括两个特殊字段。
**（1）Access-Control-Request-Method**
该字段是必须的，用来列出浏览器的CORS请求会用到哪些HTTP方法，上例是PUT。
**（2）Access-Control-Request-Headers**
该字段是一个逗号分隔的字符串，指定浏览器CORS请求会额外发送的头信息字段，上例是X-Custom-Header。

<a name="dmhUu"></a>

#### 预检请求的回应

服务器收到"预检"请求以后，检查了Origin、Access-Control-Request-Method和Access-Control-Request-Headers字段以后，确认允许跨源请求，就可以做出回应。

```http
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2.0.61 (Unix)
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Content-Type: text/html; charset=utf-8
Content-Encoding: gzip
Content-Length: 0
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain
```

上面的HTTP回应中，关键的是**Access-Control-Allow-Origin**字段，表示http://api.bob.com可以请求数据。该字段也可以设为星号，表示同意任意跨源请求。

```http
Access-Control-Allow-Origin: *
```

如果服务器否定了"预检"请求，会返回一个正常的HTTP回应，但是没有任何CORS相关的头信息字段。这时，浏览器就会认定，服务器不同意预检请求，因此触发一个错误，被XMLHttpRequest对象的onerror回调函数捕获。控制台会打印出如下的报错信息。

```bash
XMLHttpRequest cannot load http://api.alice.com.
Origin http://api.bob.com is not allowed by Access-Control-Allow-Origin.
```

服务器回应的其他CORS相关字段如下。

```http
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000
```

**（1）Access-Control-Allow-Methods**
该字段必需，它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。注意，返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次"预检"请求。
**（2）Access-Control-Allow-Headers**
如果浏览器请求包括Access-Control-Request-Headers字段，则Access-Control-Allow-Headers字段是必需的。它也是一个逗号分隔的字符串，表明服务器支持的所有头信息字段，不限于浏览器在"预检"中请求的字段。
**（3）Access-Control-Allow-Credentials**
该字段与简单请求时的含义相同。
**（4）Access-Control-Max-Age**
该字段可选，用来指定本次预检请求的有效期，单位为秒。上面结果中，有效期是20天（1728000秒），即允许缓存该条回应1728000秒（即20天），在此期间，不用发出另一条预检请求。

<a name="lUGJT"></a>

#### 浏览器的正确请求和回应

一旦服务器通过了"预检"请求，以后每次浏览器正常的CORS请求，就都跟简单请求一样，会有一个Origin头信息字段。服务器的回应，也都会有一个Access-Control-Allow-Origin头信息字段。
**下面是"预检"请求之后，浏览器的正常CORS请求。**

```http
PUT /cors HTTP/1.1
Origin: http://api.bob.com
Host: api.alice.com
X-Custom-Header: value
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

上面头信息的**Origin**字段是浏览器自动添加的。
**下面是服务器正常的回应。**

```http
Access-Control-Allow-Origin: http://api.bob.com
Content-Type: text/html; charset=utf-8
```

上面头信息中，Access-Control-Allow-Origin字段是每次回应都必定包含的。

<a name="sP2x4"></a>

# MySQL

<a name="aOWaS"></a>

## 执行 select 语句发生了什么

> MySQL执行流程

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708610339438-a0b171ee-0c1e-48e5-8bc2-06e05c1e10bd.png#averageHue=%23f3f0eb&clientId=u4cfdbc89-b6bf-4&from=paste&height=459&id=iOygd&originHeight=574&originWidth=984&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=220374&status=done&style=none&taskId=u5a7fad78-df9d-4854-ab43-1fd43c11bfc&title=&width=787.2)
可以看到， MySQL 的架构共分为两层：**Server 层和存储引擎层**，

- **Server 层负责建立连接、分析和执行 SQL**。MySQL 大多数的核心功能模块都在这实现，主要包括连接器，查询缓存、解析器、预处理器、优化器、执行器等。另外，所有的内置函数（如日期、时间、数学和加密函数等）和所有跨存储引擎的功能（如存储过程、触发器、视图等。）都在 Server 层实现。
- **存储引擎层负责数据的存储和提取**。支持 InnoDB、MyISAM、Memory 等多个存储引擎，不同的存储引擎共用一个 Server 层。现在最常用的存储引擎是 InnoDB，从 MySQL 5.5 版本开始， InnoDB 成为了 MySQL 的默认存储引擎。我们常说的索引数据结构，就是由存储引擎层实现的，不同的存储引擎支持的索引类型也不相同，比如 InnoDB 支持索引类型是 B+树 ，且是默认使用，也就是说在数据表中创建的主键索引和二级索引默认使用的是 B+ 树索引。

<a name="YS9OB"></a>

### 第一步：连接器

空闲连接会一直占用着吗？
当然不是了，MySQL 定义了空闲连接的最大空闲时长，由 wait_timeout 参数控制的，默认值是 8 小时（28880秒），如果空闲连接超过了这个时间，连接器就会自动将它断开。
MySQL 的连接数有限制吗？
MySQL 服务支持的最大连接数由 max_connections 参数控制，比如我的 MySQL 服务默认是 151 个,超过这个值，系统就会拒绝接下来的连接请求，并报错提示“Too many connections”。

MySQL 的连接也跟 HTTP 一样，有短连接和长连接的概念，它们的区别如下：

```ruby
// 短连接
连接 mysql 服务（TCP 三次握手）
执行sql
断开 mysql 服务（TCP 四次挥手）

// 长连接
连接 mysql 服务（TCP 三次握手）
执行sql
执行sql
执行sql
....
  断开 mysql 服务（TCP 四次挥手）
```

可以看到，使用长连接的好处就是可以减少建立连接和断开连接的过程，所以一般是推荐使用长连接。
怎么解决长连接占用内存的问题？
有两种解决方式。
第一种，**定期断开长连接**。既然断开连接后就会释放连接占用的内存资源，那么我们可以定期断开长连接。
第二种，**客户端主动重置连接**。MySQL 5.7 版本实现了 mysql_reset_connection() 函数的接口，注意这是接口函数不是命令，那么当客户端执行了一个很大的操作后，在代码里调用 mysql_reset_connection 函数来重置连接，达到释放内存的效果。这个过程不需要重连和重新做权限验证，但是会将连接恢复到刚刚创建完时的状态。
至此，连接器的工作做完了，简单总结一下：

- 与客户端进行 TCP 三次握手建立连接；
- 校验客户端的用户名和密码，如果用户名或密码不对，则会报错；
- 如果用户名和密码都对了，会读取该用户的权限，然后后面的权限逻辑判断都基于此时读取到的权限；

<a name="u1Y6T"></a>

### 第二步：查询缓存

对于更新比较频繁的表，查询缓存的命中率很低的，因为只要一个表有更新操作，那么这个表的查询缓存就会被清空。如果刚缓存了一个查询结果很大的数据，还没被使用的时候，刚好这个表有更新操作，查询缓冲就被清空了，相当于缓存了个寂寞。
所以，MySQL 8.0 版本直接将查询缓存删掉了，也就是说 MySQL 8.0 开始，执行一条 SQL 查询语句，不会再走到查询缓存这个阶段了。
对于 MySQL 8.0 之前的版本，如果想关闭查询缓存，我们可以通过将参数 query_cache_type 设置成 DEMAND。
**TIP**
这里说的查询缓存是 server 层的，也就是 MySQL 8.0 版本移除的是 server 层的查询缓存，并不是 Innodb 存储引擎中的 buffer pool。

<a name="f7CkT"></a>

### 第三步：解析SQL--解析器

在正式执行 SQL 查询语句之前， MySQL 会先对 SQL 语句做解析，这个工作交由「解析器」来完成。
**解析器**
解析器会做如下两件事情。
第一件事情，**词法分析**。MySQL 会根据你输入的字符串识别出关键字出来，例如，SQL语句 select username from userinfo，在分析之后，会得到4个Token，其中有2个Keyword，分别为select和from：


| 关键字 | 非关键字 | 关键字 | 非关键字 |
| ------ | -------- | ------ | -------- |
| select | username | from   | userinfo |

第二件事情，**语法分析**。根据词法分析的结果，语法解析器会根据语法规则，判断你输入的这个 SQL 语句是否满足 MySQL 语法，如果没问题就会构建出 SQL 语法树，这样方便后面模块获取 SQL 类型、表名、字段名、 where 条件等等。
通过词法分析和语法分析构建**语法树**

<a name="NMYjU"></a>

### 第四步：执行SQL语句

经过解析器后，接着就要进入执行 SQL 查询语句的流程了，每条SELECT 查询语句流程主要可以分为下面这三个阶段：

- prepare 阶段，也就是预处理阶段；---**预处理器**
- optimize 阶段，也就是优化阶段；---- **优化器**
- execute 阶段，也就是执行阶段；-----** 执行器**

经历完优化器后，就确定了执行方案，接下来 MySQL 就真正开始执行语句了，这个工作是由「执行器」完成的。在执行的过程中，执行器就会和存储引擎交互了，交互是以记录为单位的。
接下来，用三种方式执行过程，跟大家说一下执行器和存储引擎的交互过程

- 主键索引查询
- 全表扫描
- 索引下推

**总结**
执行一条 SQL 查询语句，期间发生了什么？

- 连接器：建立连接，管理连接、校验用户身份；
- 查询缓存：查询语句如果命中查询缓存则直接返回，否则继续往下执行。MySQL 8.0 已删除该模块；
- 解析 SQL，通过解析器对 SQL 查询语句进行词法分析、语法分析，然后构建语法树，方便后续模块读取表名、字段、语句类型；
- 执行 SQL：执行 SQL 共有三个阶段：
  - 预处理阶段：检查表或字段是否存在；将 select * 中的 * 符号扩展为表上的所有列。
  - 优化阶段：基于查询成本的考虑， 选择查询成本最小的执行计划；
  - 执行阶段：根据执行计划执行 SQL 查询语句，从存储引擎读取记录，返回给客户端；

<a name="eiUzW"></a>

## MySQL的一行记录时如何存储的？

<a name="lJaDu"></a>

### MySQL的数据存放在哪个文件？

我们每创建一个 database（数据库） 都会在 /var/lib/mysql/ 目录里面创建一个以 database 为名的目录，然后保存表结构和表数据的文件都会存放在这个目录里。

- db.opt，用来存储当前数据库的默认字符集和字符校验规则。
- t_order.frm ，t_order 的**表结构**会保存在这个文件。在 MySQL 中建立一张表都会生成一个.frm 文件，该文件是用来保存每个表的元数据信息的，主要包含表结构定义。
- t_order.ibd，t_order 的**表数据**会保存在这个文件。表数据既可以存在共享表空间文件（文件名：ibdata1）里，也可以存放在独占表空间文件（文件名：表名字.ibd）。这个行为是由参数 innodb_file_per_table 控制的，若设置了参数 innodb_file_per_table 为 1，则会将存储的数据、索引等信息单独存储在一个独占表空间，从 MySQL 5.6.6 版本开始，它的默认值就是 1 了，因此从这个版本之后， MySQL 中每一张表的数据都存放在一个独立的 .ibd 文件。

好了，现在我们知道了一张数据库表的数据是保存在「 表名字.ibd 」的文件里的，这个文件也称为独占表空间文件。
<a name="kWbIk"></a>

### 

<a name="OdKN4"></a>

### 表空间文件的结构是怎么样的呢？

**表空间由段（segment）、区（extent）、页（page）、行（row）组成**，InnoDB存储引擎的逻辑存储结构大致如下图：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708613120855-07dd8f15-2351-46e9-be1e-d208670038a7.png#averageHue=%23d2dbc3&clientId=u4cfdbc89-b6bf-4&from=paste&height=660&id=UQfKC&originHeight=825&originWidth=881&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=275782&status=done&style=none&taskId=u582bd5ff-391a-45af-abf5-e03846116c3&title=&width=704.8)
<a name="bZFUh"></a>

#### 1、行（row）

数据库表中的记录都是按行（row）进行存放的，每行记录根据不同的行格式，有不同的存储结构。
后面我们详细介绍 InnoDB 存储引擎的行格式，也是本文重点介绍的内容。
<a name="swy9a"></a>

#### 2、页（page）

记录是按照行来存储的，但是数据库的读取并不以「行」为单位，否则一次读取（也就是一次 I/O 操作）只能处理一行数据，效率会非常低。
因此，**InnoDB 的数据是按「页」为单位来读写的**，也就是说，当需要读一条记录的时候，并不是将这个行记录从磁盘读出来，而是以页为单位，将其整体读入内存。
**默认每个页的大小为 16KB**，也就是最多能保证 16KB 的连续存储空间。
页是 InnoDB 存储引擎磁盘管理的最小单元，意味着数据库每次读写都是以 16KB 为单位的，一次最少从磁盘中读取 16K 的内容到内存中，一次最少把内存中的 16K 内容刷新到磁盘中。
页的类型有很多，常见的有数据页、undo 日志页、溢出页等等。数据表中的行记录是用「数据页」来管理的，数据页的结构这里我就不讲细说了，之前文章有说过，感兴趣的可以去看这篇文章：[换一个角度看 B+ 树(opens new window)](https://xiaolincoding.com/mysql/index/page.html)
总之知道表中的记录存储在「数据页」里面就行。
<a name="cxK7o"></a>

#### 3、区（extent）

我们知道 InnoDB 存储引擎是用 B+ 树来组织数据的。
B+ 树中每一层都是通过双向链表连接起来的，如果是以页为单位来分配存储空间，那么链表中相邻的两个页之间的物理位置并不是连续的，可能离得非常远，那么磁盘查询时就会有大量的随机I/O，随机 I/O 是非常慢的。
解决这个问题也很简单，就是让链表中相邻的页的物理位置也相邻，这样就可以使用顺序 I/O 了，那么在范围查询（扫描叶子节点）的时候性能就会很高。
那具体怎么解决呢？
**在表中数据量大的时候，为某个索引分配空间的时候就不再按照页为单位分配了，而是按照区（extent）为单位分配。每个区的大小为 1MB，对于 16KB 的页来说，连续的 64 个页会被划为一个区，这样就使得链表中相邻的页的物理位置也相邻，就能使用顺序 I/O 了**。
<a name="RVBKm"></a>

#### 4、段（segment）

表空间是由各个段（segment）组成的，段是由多个区（extent）组成的。段一般分为数据段、索引段和回滚段等。

- 索引段：存放 B + 树的非叶子节点的区的集合；
- 数据段：存放 B + 树的叶子节点的区的集合；
- 回滚段：存放的是回滚数据的区的集合，之前讲[事务隔离(opens new window)](https://xiaolincoding.com/mysql/transaction/mvcc.html)的时候就介绍到了 MVCC 利用了回滚段实现了多版本查询数据。

好了，终于说完表空间的结构了。接下来，就具体讲一下 InnoDB 的行格式了。
之所以要绕一大圈才讲行记录的格式，主要是想让大家知道行记录是存储在哪个文件，以及行记录在这个表空间文件中的哪个区域，有一个从上往下切入的视角，这样理解起来不会觉得很抽象。

<a name="We10z"></a>

### InnoDB 行格式有哪些？

行格式（row_format），就是一条记录的存储结构。
InnoDB 提供了 4 种行格式，分别是 Redundant、Compact、Dynamic和 Compressed 行格式。

- Redundant 是很古老的行格式了， MySQL 5.0 版本之前用的行格式，现在基本没人用了。
- 由于 Redundant 不是一种紧凑的行格式，所以 MySQL 5.0 之后引入了 Compact 行记录存储方式，Compact 是一种紧凑的行格式，设计的初衷就是为了让一个数据页中可以存放更多的行记录，从 MySQL 5.1 版本之后，行格式默认设置成 Compact。
- Dynamic 和 Compressed 两个都是紧凑的行格式，它们的行格式都和 Compact 差不多，因为都是基于 Compact 改进一点东西。从 MySQL5.7 版本之后，默认使用 Dynamic 行格式。

Redundant 行格式我这里就不讲了，因为现在基本没人用了，这次重点介绍 Compact 行格式，因为 Dynamic 和 Compressed 这两个行格式跟 Compact 非常像。
所以，弄懂了 Compact 行格式，之后你们在去了解其他行格式，很快也能看懂。

<a name="KlI06"></a>

### Compact行格式长什么样呢？

先跟 Compact 行格式混个脸熟，它长这样：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708613759738-1e41db8e-4744-4c5f-aea8-5338fd3d15a4.png#averageHue=%23faf4f3&clientId=u4cfdbc89-b6bf-4&from=paste&id=gWAd7&originHeight=562&originWidth=2336&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2938f95d-056b-4202-bf61-14c9aafc4ce&title=)
一行varchar（65532） 2 1
<a name="mwSm1"></a>

### 行溢出后，MySQL是怎么处理的？

MySQL 中磁盘和内存交互的基本单位是页，一个页的大小一般是 16KB，也就是 16384字节，而一个 varchar(n) 类型的列最多可以存储 65532字节，一些大对象如 TEXT、BLOB 可能存储更多的数据，这时一个页可能就存不了一条记录。这个时候就会**发生行溢出，多的数据就会存到另外的「溢出页」中**。
如果一个数据页存不了一条记录，InnoDB 存储引擎会自动将溢出的数据存放到「溢出页」中。在一般情况下，InnoDB 的数据都是存放在 「数据页」中。但是当发生行溢出时，溢出的数据会存放到「溢出页」中。
当发生行溢出时，在记录的真实数据处只会保存该列的一部分数据，而把剩余的数据放在「溢出页」中，然后真实数据处用 20 字节存储指向溢出页的地址，从而可以找到剩余数据所在的页。大致如下图所示。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708614890564-4ec4339c-f92d-433f-9120-c5cebfc43d9d.png#averageHue=%23faf8f5&clientId=u4cfdbc89-b6bf-4&from=paste&id=whitr&originHeight=508&originWidth=1400&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2d64971d-41c9-4ecd-9c38-4f968940bd0&title=)
上面这个是 Compact 行格式在发生行溢出后的处理。
Compressed 和 Dynamic 这两个行格式和 Compact 非常类似，主要的区别在于处理行溢出数据时有些区别。
这两种格式采用完全的行溢出方式，记录的真实数据处不会存储该列的一部分数据，只存储 20 个字节的指针来指向溢出页。而实际的数据都存储在溢出页中，看起来就像下面这样：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708614926656-18992efd-5be3-4e18-a4ff-d0d50e088eb3.png#averageHue=%23faf6f3&clientId=u4cfdbc89-b6bf-4&from=paste&id=VizT2&originHeight=470&originWidth=1230&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u79e8ad15-3b0c-4e30-97c4-2d79cbf5cc6&title=)

<a name="YUvhO"></a>

### 总结

MySQL 的 NULL 值是怎么存放的？
MySQL 的 Compact 行格式中会用「NULL值列表」来标记值为 NULL 的列，NULL 值并不会存储在行格式中的真实数据部分。
NULL值列表会占用 1 字节空间，当表中所有字段都定义成 NOT NULL，行格式中就不会有 NULL值列表，这样可节省 1 字节的空间。
MySQL 怎么知道 varchar(n) 实际占用数据的大小？
MySQL 的 Compact 行格式中会用「变长字段长度列表」存储变长字段实际占用的数据大小。
varchar(n) 中 n 最大取值为多少？
一行记录最大能存储 65535 字节的数据，但是这个是包含「变长字段字节数列表所占用的字节数」和「NULL值列表所占用的字节数」。所以， 我们在算 varchar(n) 中 n 最大值时，需要减去这两个列表所占用的字节数。
如果一张表只有一个 varchar(n) 字段，且允许为 NULL，字符集为 ascii。varchar(n) 中 n 最大取值为 65532。
计算公式：65535 - 变长字段字节数列表所占用的字节数 - NULL值列表所占用的字节数 = 65535 - 2 - 1 = 65532。
如果有多个字段的话，要保证所有字段的长度 + 变长字段字节数列表所占用的字节数 + NULL值列表所占用的字节数 <= 65535。
行溢出后，MySQL 是怎么处理的？
如果一个数据页存不了一条记录，InnoDB 存储引擎会自动将溢出的数据存放到「溢出页」中。
Compact 行格式针对行溢出的处理是这样的：当发生行溢出时，在记录的真实数据处只会保存该列的一部分数据，而把剩余的数据放在「溢出页」中，然后真实数据处用 20 字节存储指向溢出页的地址，从而可以找到剩余数据所在的页。
Compressed 和 Dynamic 这两种格式采用完全的行溢出方式，记录的真实数据处不会存储该列的一部分数据，只存储 20 个字节的指针来指向溢出页。而实际的数据都存储在溢出页中。

<a name="FPnnp"></a>

## 索引

<a name="vFuhL"></a>

### 什么是索引？

当你想查阅书中某个知识的内容，你会选择一页一页的找呢？还是在书的目录去找呢？
傻瓜都知道时间是宝贵的，当然是选择在书的目录去找，找到后再翻到对应的页。书中的**目录**，就是充当**索引**的角色，方便我们快速查找书中的内容，所以索引是以空间换时间的设计思想。
那换到数据库中，索引的定义就是帮助存储引擎快速获取数据的一种数据结构，形象的说就是**索引是数据的目录**。
所谓的存储引擎，说白了就是如何存储数据、如何为存储的数据建立索引和如何更新、查询数据等技术的实现方法。MySQL 存储引擎有 MyISAM 、InnoDB、Memory，其中 InnoDB 是在 MySQL 5.5 之后成为默认的存储引擎。
下图是 MySQL 的结构图，索引和数据就是位于存储引擎中：

<a name="niFJ2"></a>

### 索引的分类

我们可以按照四个角度来分类索引。

- 按「数据结构」分类：**B+tree索引、Hash索引、Full-text索引**。
- 按「物理存储」分类：**聚簇索引（主键索引）、二级索引（辅助索引）**。
- 按「字段特性」分类：**主键索引、唯一索引、普通索引、前缀索引**。
- 按「字段个数」分类：**单列索引、联合索引**。

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708616379400-c613611f-dec3-4b1a-beca-dad4a486b9a6.png#averageHue=%23dbe0e2&clientId=u4cfdbc89-b6bf-4&from=paste&id=WaRtJ&originHeight=1061&originWidth=711&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ubfbb1cca-2dcd-4727-a731-0f81fc67ccc&title=)

// 西湖
// 业务 == 除了大数据 java
//   =>  k8s

<a name="X4raZ"></a>

## B+树？

<a name="RoMlM"></a>

### InnoDB是如何存储数据的？

MySQL 支持多种存储引擎，不同的存储引擎，存储数据的方式也是不同的，我们最常使用的是 InnoDB 存储引擎，所以就跟大家图解下InnoDB 是如何存储数据的。
记录是按照行来存储的，但是数据库的读取并不以「行」为单位，否则一次读取（也就是一次 I/O 操作）只能处理一行数据，效率会非常低。
因此，**InnoDB 的数据是按「数据页」为单位来读写的**，也就是说，当需要读一条记录的时候，并不是将这个记录本身从磁盘读出来，而是以页为单位，将其整体读入内存。
数据库的 I/O 操作的最小单位是页，**InnoDB 数据页的默认大小是 16KB**，意味着数据库每次读写都是以 16KB 为单位的，一次最少从磁盘中读取 16K 的内容到内存中，一次最少把内存中的 16K 内容刷新到磁盘中。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708665403921-bae2cf52-61d3-4686-82ef-6fab686ebcc6.png#averageHue=%23f4f2ef&clientId=u2fce1967-60af-4&from=paste&id=GzHsI&originHeight=843&originWidth=692&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u75f63393-1bd2-47f1-ae7a-06f9719029d&title=)

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708665482283-965b5b1d-d509-40c6-9d63-382283325e00.png#averageHue=%23f2f0e7&clientId=u2fce1967-60af-4&from=paste&id=mWU83&originHeight=602&originWidth=962&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u19a9e62b-7126-4a5b-84b1-4bd2f482bd4&title=)

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708665781924-ef528373-8779-4cec-8165-65551eb339e7.png#averageHue=%23f0f1e1&clientId=u2fce1967-60af-4&from=paste&id=n6aH7&originHeight=1228&originWidth=1080&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uee17b7ef-a5b9-40dc-9189-fd6799f40d2&title=)

页目录创建的过程如下：

1. 将所有的记录划分成几个组，这些记录包括最小记录和最大记录，但不包括标记为“已删除”的记录；
2. 每个记录组的最后一条记录就是组内最大的那条记录，并且最后一条记录的头信息中会存储该组一共有多少条记录，作为 n_owned 字段（上图中粉红色字段）
3. 页目录用来存储每组最后一条记录的地址偏移量，这些地址偏移量会按照先后顺序存储起来，每组的地址偏移量也被称之为槽（slot），**每个槽相当于指针指向了不同组的最后一个记录**。

从图可以看到，**页目录就是由多个槽组成的，槽相当于分组记录的索引**。然后，因为记录是按照「主键值」从小到大排序的，所以**我们通过槽查找记录时，可以使用二分法快速定位要查询的记录在哪个槽（哪个记录分组），定位到槽后，再遍历槽内的所有记录，找到对应的记录**，无需从最小记录开始遍历整个页中的记录链表。
以上面那张图举个例子，5 个槽的编号分别为 0，1，2，3，4，我想查找主键为 11 的用户记录：

- 先二分得出槽中间位是 (0+4)/2=2 ，2号槽里最大的记录为 8。因为 11 > 8，所以需要从 2 号槽后继续搜索记录；
- 再使用二分搜索出 2 号和 4 槽的中间位是 (2+4)/2= 3，3 号槽里最大的记录为 12。因为 11 < 12，所以主键为 11 的记录在 3 号槽里；
- 这里有个问题，**「槽对应的值都是这个组的主键最大的记录，如何找到组里最小的记录」**？比如槽 3 对应最大主键是 12 的记录，那如何找到最小记录 9。解决办法是：通过槽 3 找到 槽 2 对应的记录，也就是主键为 8 的记录。主键为 8 的记录的下一条记录就是槽 3 当中主键最小的 9 记录，然后开始向下搜索 2 次，定位到主键为 11 的记录，取出该条记录的信息即为我们想要查找的内容。

看到第三步的时候，可能有的同学会疑问，如果某个槽内的记录很多，然后因为记录都是单向链表串起来的，那这样在槽内查找某个记录的时间复杂度不就是 O(n) 了吗？
这点不用担心，InnoDB 对每个分组中的记录条数都是有规定的，槽内的记录就只有几条：

- 第一个分组中的记录只能有 1 条记录；
- 最后一个分组中的记录条数范围只能在 1-8 条之间；
- 剩下的分组中记录条数范围只能在 4-8 条之间。

<a name="kJVaQ"></a>

### B+树是如何进行查询的呢？

InnoDB 的数据是按「数据页」为单位来读写的，默认数据页大小为 16 KB。每个数据页之间通过双向链表的形式组织起来，物理上不连续，但是逻辑上连续。
数据页内包含用户记录，每个记录之间用单向链表的方式组织起来，为了加快在数据页内高效查询记录，设计了一个页目录，页目录存储各个槽（分组），且主键值是有序的，于是可以通过二分查找法的方式进行检索从而提高效率。
为了高效查询记录所在的数据页，InnoDB 采用 b+ 树作为索引，每个节点都是一个数据页。
如果叶子节点存储的是实际数据的就是聚簇索引，一个表只能有一个聚簇索引；如果叶子节点存储的不是实际数据，而是主键值则就是二级索引，一个表中可以有多个二级索引。
在使用二级索引进行查找数据时，如果查询的数据能在二级索引找到，那么就是「索引覆盖」操作，如果查询的数据不在二级索引里，就需要先在二级索引找到主键值，需要去聚簇索引中获得数据行，这个过程就叫作「回表」。

<a name="GeTZl"></a>

### MySQL为什么采用B+树作为索引？

MySQL 是会将数据持久化在硬盘，而存储功能是由 MySQL 存储引擎实现的，所以讨论 MySQL 使用哪种数据结构作为索引，实际上是在讨论存储引使用哪种数据结构作为索引，InnoDB 是 MySQL 默认的存储引擎，它就是采用了 B+ 树作为索引的数据结构。
要设计一个 MySQL 的索引数据结构，不仅仅考虑数据结构增删改的时间复杂度，更重要的是要考虑磁盘 I/0 的操作次数。因为索引和记录都是存放在硬盘，硬盘是一个非常慢的存储设备，我们在查询数据的时候，最好能在尽可能少的磁盘 I/0 的操作次数内完成。
二分查找树虽然是一个天然的二分结构，能很好的利用二分查找快速定位数据，但是它存在一种极端的情况，每当插入的元素都是树内最大的元素，就会导致二分查找树退化成一个链表，此时查询复杂度就会从 O(logn)降低为 O(n)。
为了解决二分查找树退化成链表的问题，就出现了自平衡二叉树，保证了查询操作的时间复杂度就会一直维持在 O(logn) 。但是它本质上还是一个二叉树，每个节点只能有 2 个子节点，随着元素的增多，树的高度会越来越高。
而树的高度决定于磁盘 I/O 操作的次数，因为树是存储在磁盘中的，访问每个节点，都对应一次磁盘 I/O 操作，也就是说树的高度就等于每次查询数据时磁盘 IO 操作的次数，所以树的高度越高，就会影响查询性能。
B 树和 B+ 都是通过多叉树的方式，会将树的高度变矮，所以这两个数据结构非常适合检索存于磁盘中的数据。
但是 MySQL 默认的存储引擎 InnoDB 采用的是 B+ 作为索引的数据结构，原因有：

- B+ 树的非叶子节点不存放实际的记录数据，仅存放索引，因此数据量相同的情况下，相比存储即存索引又存记录的 B 树，B+树的非叶子节点可以存放更多的索引，因此 B+ 树可以比 B 树更「矮胖」，查询底层节点的磁盘 I/O次数会更少。
- B+ 树有大量的冗余节点（所有非叶子节点都是冗余索引），这些冗余索引让 B+ 树在插入、删除的效率都更高，比如删除根节点的时候，不会像 B 树那样会发生复杂的树的变化；
- B+ 树叶子节点之间用链表连接了起来，有利于范围查询，而 B 树要实现范围查询，因此只能通过树的遍历来完成范围查询，这会涉及多个节点的磁盘 I/O 操作，范围查询效率不如 B+ 树。

<a name="VJybE"></a>

## 事务

<a name="hCWQI"></a>

### 事务隔离级别是如何实现的？

<a name="mtUHE"></a>

#### 事务有哪些特性呢？

事务是由 MySQL 的引擎来实现的，我们常见的 InnoDB 引擎它是支持事务的。
不过并不是所有的引擎都能支持事务，比如 MySQL 原生的 MyISAM 引擎就不支持事务，也正是这样，所以大多数 MySQL 的引擎都是用 InnoDB。
事务看起来感觉简单，但是要实现事务必须要遵守 4 个特性，分别如下：

- **原子性（Atomicity）**：一个事务中的所有操作，要么全部完成，要么全部不完成，不会结束在中间某个环节，而且事务在执行过程中发生错误，会被回滚到事务开始前的状态，就像这个事务从来没有执行过一样，就好比买一件商品，购买成功时，则给商家付了钱，商品到手；购买失败时，则商品在商家手中，消费者的钱也没花出去。
- **一致性（Consistency）**：是指事务操作前和操作后，数据满足完整性约束，数据库保持一致性状态。比如，用户 A 和用户 B 在银行分别有 800 元和 600 元，总共 1400 元，用户 A 给用户 B 转账 200 元，分为两个步骤，从 A 的账户扣除 200 元和对 B 的账户增加 200 元。一致性就是要求上述步骤操作后，最后的结果是用户 A 还有 600 元，用户 B 有 800 元，总共 1400 元，而不会出现用户 A 扣除了 200 元，但用户 B 未增加的情况（该情况，用户 A 和 B 均为 600 元，总共 1200 元）。
- **隔离性（Isolation）**：数据库允许多个并发事务同时对其数据进行读写和修改的能力，隔离性可以防止多个事务并发执行时由于交叉执行而导致数据的不一致，因为多个事务同时使用相同的数据时，不会相互干扰，每个事务都有一个完整的数据空间，对其他并发事务是隔离的。也就是说，消费者购买商品这个事务，是不影响其他消费者购买的。
- **持久性（Durability）**：事务处理结束后，对数据的修改就是永久的，即便系统故障也不会丢失。

InnoDB 引擎通过什么技术来保证事务的这四个特性的呢？

- 持久性是通过 redo log （重做日志）来保证的；
- 原子性是通过 undo log（回滚日志） 来保证的；
- 隔离性是通过 MVCC（多版本并发控制） 或锁机制来保证的；
- 一致性则是通过持久性+原子性+隔离性来保证；

这次将**重点介绍事务的隔离性**，这也是面试时最常问的知识的点。
为什么事务要有隔离性，我们就要知道并发事务时会引发什么问题。

<a name="gKd4C"></a>

#### 事务隔离级别有哪些？

前面我们提到，当多个事务并发执行时可能会遇到「脏读、不可重复读、幻读」的现象，这些现象会对事务的一致性产生不同程序的影响。

- 脏读：读到其他事务未提交的数据；
- 不可重复读：前后读取的数据不一致；
- 幻读：前后读取的记录数量不一致。

这三个现象的严重性排序如下
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708669652363-86aa4950-a035-497e-b314-0ce6f8479ee5.png#averageHue=%23f4e8e2&clientId=u2fce1967-60af-4&from=paste&id=Q0VL0&originHeight=140&originWidth=677&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u1c122537-d973-4268-a4f1-c0a22484fdf&title=)

SQL 标准提出了四种隔离级别来规避这些现象，隔离级别越高，性能效率就越低，这四个隔离级别如下：

- **读未提交（_read uncommitted_）**，指一个事务还没提交时，它做的变更就能被其他事务看到；
- **读提交（_read committed_）**，指一个事务提交之后，它做的变更才能被其他事务看到；
- **可重复读（_repeatable read_）**，指一个事务执行过程中看到的数据，一直跟这个事务启动时看到的数据是一致的，**MySQL InnoDB 引擎的默认隔离级别**；
- **串行化（_serializable_ ）**；会对记录加上读写锁，在多个事务对这条记录进行读写操作时，如果发生了读写冲突的时候，后访问的事务必须等前一个事务执行完成，才能继续执行；
  <a name="je0Sc"></a>

### 总结

事务是在 MySQL 引擎层实现的，我们常见的 InnoDB 引擎是支持事务的，事务的四大特性是原子性、一致性、隔离性、持久性，我们这次主要讲的是隔离性。
当多个事务并发执行的时候，会引发脏读、不可重复读、幻读这些问题，那为了避免这些问题，SQL 提出了四种隔离级别，分别是读未提交、读已提交、可重复读、串行化，从左往右隔离级别顺序递增，隔离级别越高，意味着性能越差，InnoDB 引擎的默认隔离级别是可重复读。
要解决脏读现象，就要将隔离级别升级到读已提交以上的隔离级别，要解决不可重复读现象，就要将隔离级别升级到可重复读以上的隔离级别。
而对于幻读现象，不建议将隔离级别升级为串行化，因为这会导致数据库并发时性能很差。MySQL InnoDB 引擎的默认隔离级别虽然是「可重复读」，但是它很大程度上避免幻读现象（并不是完全解决了，详见这篇[文章(opens new window)](https://xiaolincoding.com/mysql/transaction/phantom.html)），解决的方案有两种：

- 针对**快照读**（普通 select 语句），是**通过 MVCC 方式解决了幻读**，因为可重复读隔离级别下，事务执行过程中看到的数据，一直跟这个事务启动时看到的数据是一致的，即使中途有其他事务插入了一条数据，是查询不出来这条数据的，所以就很好了避免幻读问题。
- 针对**当前读**（select ... for update 等语句），是**通过 next-key lock（记录锁+间隙锁）方式解决了幻读**，因为当执行 select ... for update 语句的时候，会加上 next-key lock，如果有其他事务在 next-key lock 锁范围内插入了一条记录，那么这个插入语句就会被阻塞，无法成功插入，所以就很好了避免幻读问题。

对于「读提交」和「可重复读」隔离级别的事务来说，它们是通过 Read View 来实现的，它们的区别在于创建 Read View 的时机不同：

- 「读提交」隔离级别是在每个 select 都会生成一个新的 Read View，也意味着，事务期间的多次读取同一条数据，前后两次读的数据可能会出现不一致，因为可能这期间另外一个事务修改了该记录，并提交了事务。
- 「可重复读」隔离级别是启动事务时生成一个 Read View，然后整个事务期间都在用这个 Read View，这样就保证了在事务期间读到的数据都是事务启动前的记录。

这两个隔离级别实现是通过「事务的 Read View 里的字段」和「记录中的两个隐藏列」的比对，来控制并发事务访问同一个记录时的行为，这就叫 MVCC（多版本并发控制）。
在可重复读隔离级别中，普通的 select 语句就是基于 MVCC 实现的快照读，也就是不会加锁的。而 select .. for update 语句就不是快照读了，而是当前读了，也就是每次读都是拿到最新版本的数据，但是它会对读到的记录加上 next-key lock 锁。

MySQL InnoDB 引擎的可重复读隔离级别（默认隔离级），根据不同的查询方式，分别提出了避免幻读的方案：

- 针对**快照读**（普通 select 语句），是通过 MVCC 方式解决了幻读。
- 针对**当前读**（select ... for update 等语句），是通过 next-key lock（记录锁+间隙锁）方式解决了幻读。

我举例了两个发生幻读场景的例子。
第一个例子：对于快照读， MVCC 并不能完全避免幻读现象。因为当事务 A 更新了一条事务 B 插入的记录，那么事务 A 前后两次查询的记录条目就不一样了，所以就发生幻读。
第二个例子：对于当前读，如果事务开启后，并没有执行当前读，而是先快照读，然后这期间如果其他事务插入了一条记录，那么事务后续使用当前读进行查询的时候，就会发现两次查询的记录条目就不一样了，所以就发生幻读。
所以，**MySQL 可重复读隔离级别并没有彻底解决幻读，只是很大程度上避免了幻读现象的发生。**
要避免这类特殊场景下发生幻读的现象的话，就是尽量在开启事务之后，马上执行 select ... for update 这类当前读的语句，因为它会对记录加 next-key lock，从而避免其他事务插入一条新记录。

<a name="UXIDN"></a>

## 锁

<a name="bBATO"></a>

### 全局锁

全局锁是怎么用的？
要使用全局锁，则要执行这条命令：

```sql
flush tables with read lock
```

执行后，**整个数据库就处于只读状态了**，这时其他线程执行以下操作，都会被阻塞：

- 对数据的增删改操作，比如 insert、delete、update等语句；
- 对表结构的更改操作，比如 alter table、drop table 等语句。

全局锁应用场景是什么？
全局锁主要应用于做**全库逻辑备份**，这样在备份数据库期间，不会因为数据或表结构的更新，而出现备份文件的数据与预期的不一样。
举个例子大家就知道了。
在全库逻辑备份期间，假设不加全局锁的场景，看看会出现什么意外的情况。
如果在全库逻辑备份期间，有用户购买了一件商品，一般购买商品的业务逻辑是会涉及到多张数据库表的更新，比如在用户表更新该用户的余额，然后在商品表更新被购买的商品的库存。
那么，有可能出现这样的顺序：

1. 先备份了用户表的数据；
2. 然后有用户发起了购买商品的操作；
3. 接着再备份商品表的数据。

也就是在备份用户表和商品表之间，有用户购买了商品。
这种情况下，备份的结果是用户表中该用户的余额并没有扣除，反而商品表中该商品的库存被减少了，如果后面用这个备份文件恢复数据库数据的话，用户钱没少，而库存少了，等于用户白嫖了一件商品。
所以，在全库逻辑备份期间，加上全局锁，就不会出现上面这种情况了。

加全局锁又会带来什么缺点呢？
加上全局锁，意味着整个数据库都是只读状态。
那么如果数据库里有很多数据，备份就会花费很多的时间，关键是备份期间，业务只能读数据，而不能更新数据，这样会造成业务停滞。

既然备份数据库数据的时候，使用全局锁会影响业务，那有什么其他方式可以避免？
有的，如果数据库的引擎支持的事务支持**可重复读的隔离级别**，那么在备份数据库之前先开启事务，会先创建 Read View，然后整个事务执行期间都在用这个 Read View，而且由于 MVCC 的支持，备份期间业务依然可以对数据进行更新操作。
因为在可重复读的隔离级别下，即使其他事务更新了表的数据，也不会影响备份数据库时的 Read View，这就是事务四大特性中的隔离性，这样备份期间备份的数据一直是在开启事务时的数据。
备份数据库的工具是 mysqldump，在使用 mysqldump 时加上 –single-transaction 参数的时候，就会在备份数据库之前先开启事务。这种方法只适用于支持「可重复读隔离级别的事务」的存储引擎。
InnoDB 存储引擎默认的事务隔离级别正是可重复读，因此可以采用这种方式来备份数据库。
但是，对于 MyISAM 这种不支持事务的引擎，在备份数据库时就要使用全局锁的方法。

<a name="sGFeh"></a>

### 表级锁

MySQL 表级锁有哪些？具体怎么用的。
MySQL 里面表级别的锁有这几种：

- 表锁；
- 元数据锁（MDL）; 锁结构的，每个sql语句执行的时候都会拿到这个锁。
- 意向锁；
- AUTO-INC 锁；

MySQL的Online DDL

1. MDL 是一种表锁，不需要显式使用，在访问一个表的时候会被自动加上。MDL 的作用是，保证读写的正确性。
2. 简单的理解就是用线程在访问一张表的数据(查询或者DML操作)时，是不允许其他线程修改此表的结构的，这个限制就是通过MDL来实现的
3. 对于表数据的操作(查询or DML)获取的是MDL读锁
4. 对于表结构的修改操作会有MDL写锁和读锁，主要是为了并发高效性和数据一致性，**会有锁的降级和升级过程**

<a name="KP8tO"></a>

### 行锁

InnoDB 引擎是支持行级锁的，而 MyISAM 引擎并不支持行级锁。
前面也提到，普通的 select 语句是不会对记录加锁的，因为它属于快照读。如果要在查询时对记录加行锁，可以使用下面这两个方式，这种查询会加锁的语句称为**锁定读**。

```sql
//对读取的记录加共享锁
select ... lock in share mode;

//对读取的记录加独占锁
select ... for update;
```

上面这两条语句必须在一个事务中，**因为当事务提交了，锁就会被释放**，所以在使用这两条语句的时候，要加上 begin、start transaction 或者 set autocommit = 0。
共享锁（S锁）满足读读共享，读写互斥。独占锁（X锁）满足写写互斥、读写互斥。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708673274301-02c9e67f-3c67-40e4-ac20-1634cc1a0778.png#averageHue=%23faedce&clientId=u2fce1967-60af-4&from=paste&id=llLoX&originHeight=226&originWidth=572&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u6e9800c9-1e51-4bde-9493-d2b56cd1e35&title=)

行级锁的类型主要有三类：

- Record Lock，记录锁，也就是仅仅把一条记录锁上；
- Gap Lock，间隙锁，锁定一个范围，但是不包含记录本身；
- Next-Key Lock：Record Lock + Gap Lock 的组合，锁定一个范围，并且锁定记录本身。

<a name="WvdxA"></a>

### MySQL是如何枷锁的

不要小看一条 update 语句，在生产机上使用不当可能会导致业务停滞，甚至崩溃。
当我们要执行 update 语句的时候，确保 where 条件中带上了索引列，并且在测试机确认该语句是否走的是索引扫描，防止因为扫描全表，而对表中的所有记录加上锁。
我们可以打开 MySQL sql_safe_updates 参数，这样可以预防 update 操作时 where 条件没有带上索引列。
如果发现即使在 where 条件中带上了列索引列，优化器走的还是全标扫描，这时我们就要使用 force index([index_name]) 可以告诉优化器使用哪个索引。
这次就说到这啦，下次要小心点，别再被老板挨骂啦。

<a name="KUZ6g"></a>

### MySQL死锁了该怎么办？

死锁的四个必要条件：**互斥、占有且等待、不可强占用、循环等待**。只要系统发生死锁，这些条件必然成立，但是只要破坏任意一个条件就死锁就不会成立。
在数据库层面，有两种策略通过「打破循环等待条件」来解除死锁状态：

- **设置事务等待锁的超时时间**。当一个事务的等待时间超过该值后，就对这个事务进行回滚，于是锁就释放了，另一个事务就可以继续执行了。在 InnoDB 中，参数 innodb_lock_wait_timeout 是用来设置超时时间的，默认值时 50 秒。当发生超时后，就出现下面这个提示：

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708751631269-9e3e93fe-2394-4785-8d88-a554e99caa2d.png#averageHue=%2312141b&clientId=u4109e80c-3d52-4&from=paste&id=Q3QhO&originHeight=31&originWidth=1080&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u1244b2c2-0105-4b11-8908-690ea0ea270&title=)

- **开启主动死锁检测**。主动死锁检测在发现死锁后，主动回滚死锁链条中的某一个事务，让其他事务得以继续执行。将参数 innodb_deadlock_detect 设置为 on，表示开启这个逻辑，默认就开启。当检测到死锁后，就会出现下面这个提示：

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1708751631305-4f6e222c-24cd-4c91-949b-d6e4001c6e74.png#averageHue=%2312141c&clientId=u4109e80c-3d52-4&from=paste&id=ZRxYD&originHeight=28&originWidth=1080&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u5ce9ded9-a542-4fc1-acc8-043edaba054&title=)
上面这个两种策略是「当有死锁发生时」的避免方式。
我们可以回归业务的角度来预防死锁，对订单做幂等性校验的目的是为了保证不会出现重复的订单，那我们可以直接将 order_no 字段设置为唯一索引列，利用它的唯一性来保证订单表不会出现重复的订单，不过有一点不好的地方就是在我们插入一个已经存在的订单记录时就会抛出异常。

<a name="y50ja"></a>

## 日志

<a name="Ebg3D"></a>

### undo log

实现这一机制就是 **undo log（回滚日志），它保证了事务的 **[ACID 特性(opens new window)](https://xiaolincoding.com/mysql/transaction/mvcc.html#%E4%BA%8B%E5%8A%A1%E6%9C%89%E5%93%AA%E4%BA%9B%E7%89%B9%E6%80%A7)**中的原子性（Atomicity）**。
undo log 是一种用于撤销回退的日志。在事务没提交之前，MySQL 会先记录更新前的数据到 undo log 日志文件里面，当事务回滚时，可以利用 undo log 来进行回滚。如下图：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710819283346-def5ce71-da54-433e-ac10-28128ed0ddf5.png#averageHue=%23f9f6ef&clientId=u278da3fc-d7ae-4&from=paste&id=atnb5&originHeight=571&originWidth=352&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u4aeb6148-02c5-4f02-ae0c-42a55cfc8a2&title=)
每当 InnoDB 引擎对一条记录进行操作（修改、删除、新增）时，要把回滚时需要的信息都记录到 undo log 里，比如：

- 在**插入**一条记录时，要把这条记录的主键值记下来，这样之后回滚时只需要把这个主键值对应的记录**删掉**就好了；
- 在**删除**一条记录时，要把这条记录中的内容都记下来，这样之后回滚时再把由这些内容组成的记录**插入**到表中就好了；
- 在**更新**一条记录时，要把被更新的列的旧值记下来，这样之后回滚时再把这些列**更新为旧值**就好了。

一条记录的每一次更新操作产生的 undo log 格式都有一个 roll_pointer 指针和一个 trx_id 事务id：

- 通过 trx_id 可以知道该记录是被哪个事务修改的；
- 通过 roll_pointer 指针可以将这些 undo log 串成一个链表，这个链表就被称为版本链；

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710819332512-e117bf80-ba6a-4964-914f-0500e69b087d.png#averageHue=%23f5f3ec&clientId=u278da3fc-d7ae-4&from=paste&height=303&id=WnF8U&originHeight=379&originWidth=776&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=90582&status=done&style=none&taskId=u62dab22b-fe0e-46e6-8cc8-3467f2f2af7&title=&width=620.8)
另外，**undo log 还有一个作用，通过 ReadView + undo log 实现 MVCC（多版本并发控制）**。
对于「读提交」和「可重复读」隔离级别的事务来说，它们的快照读（普通 select 语句）是通过 Read View + undo log 来实现的，它们的区别在于创建 Read View 的时机不同：

- 「读提交」隔离级别是在每个 select 都会生成一个新的 Read View，也意味着，事务期间的多次读取同一条数据，前后两次读的数据可能会出现不一致，因为可能这期间另外一个事务修改了该记录，并提交了事务。
- 「可重复读」隔离级别是启动事务时生成一个 Read View，然后整个事务期间都在用这个 Read View，这样就保证了在事务期间读到的数据都是事务启动前的记录。

这两个隔离级别实现是通过「事务的 Read View 里的字段」和「记录中的两个隐藏列（trx_id 和 roll_pointer）」的比对，如果不满足可见行，就会顺着 undo log 版本链里找到满足其可见性的记录，从而控制并发事务访问同一个记录时的行为，这就叫 MVCC（多版本并发控制）。具体的实现可以看我这篇文章：[事务隔离级别是怎么实现的？(opens new window)](https://xiaolincoding.com/mysql/transaction/mvcc.html#%E4%BA%8B%E5%8A%A1%E7%9A%84%E9%9A%94%E7%A6%BB%E7%BA%A7%E5%88%AB%E6%9C%89%E5%93%AA%E4%BA%9B)
因此，undo log 两大作用：

- **实现事务回滚，保障事务的原子性**。事务处理过程中，如果出现了错误或者用户执 行了 ROLLBACK 语句，MySQL 可以利用 undo log 中的历史数据将数据恢复到事务开始之前的状态。
- **实现 MVCC（多版本并发控制）关键因素之一**。MVCC 是通过 ReadView + undo log 实现的。undo log 为每条记录保存多份历史数据，MySQL 在执行快照读（普通 select 语句）的时候，会根据事务的 Read View 里的信息，顺着 undo log 的版本链找到满足其可见性的记录。
  <a name="yMW80"></a>

### redo log

为了防止断电导致数据丢失的问题，当有一条记录需要更新的时候，InnoDB 引擎就会先更新内存（同时标记为脏页），然后将本次对这个页的修改以 redo log 的形式记录下来，**这个时候更新就算完成了**。
后续，InnoDB 引擎会在适当的时候，由后台线程将缓存在 Buffer Pool 的脏页刷新到磁盘里，这就是 **WAL （Write-Ahead Logging）技术**。
**WAL 技术指的是， MySQL 的写操作并不是立刻写到磁盘上，而是先写日志，然后在合适的时间再写到磁盘上**。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710819756535-425d7f90-44c9-4529-abb1-a7e43afc3d27.png#averageHue=%23f8f3ec&clientId=u278da3fc-d7ae-4&from=paste&id=DBZ3V&originHeight=977&originWidth=1292&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u866b3fe5-0bf5-4db8-b284-f23ee896998&title=)
redo log 是物理日志，记录了某个数据页做了什么修改，比如**对 XXX 表空间中的 YYY 数据页 ZZZ 偏移量的地方做了AAA 更新**，每当执行一个事务就会产生这样的一条或者多条物理日志。
在事务提交时，只要先将 redo log 持久化到磁盘即可，可以不需要等到将缓存在 Buffer Pool 里的脏页数据持久化到磁盘。
当系统崩溃时，虽然脏页数据没有持久化，但是 redo log 已经持久化，接着 MySQL 重启后，可以根据 redo log 的内容，将所有数据恢复到最新的状态。

被修改 Undo 页面，需要记录对应 redo log 吗？
需要的。
开启事务后，InnoDB 层更新记录前，首先要记录相应的 undo log，如果是更新操作，需要把被更新的列的旧值记下来，也就是要生成一条 undo log，undo log 会写入 Buffer Pool 中的 Undo 页面。
不过，**在内存修改该 Undo 页面后，需要记录对应的 redo log**。

redo log 和 undo log 区别在哪？
这两种日志是属于 InnoDB 存储引擎的日志，它们的区别在于：

- redo log 记录了此次事务「**完成后**」的数据状态，记录的是更新**之后**的值；
- undo log 记录了此次事务「**开始前**」的数据状态，记录的是更新**之前**的值；

事务提交之前发生了崩溃，重启后会通过 undo log 回滚事务，事务提交之后发生了崩溃，重启后会通过 redo log 恢复事务，如下图：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710819850920-1a437ece-8b93-44c4-af7d-6c0ab2bbfdf3.png#averageHue=%23fbf7f3&clientId=u278da3fc-d7ae-4&from=paste&id=KUzH9&originHeight=601&originWidth=551&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2e5cd4ad-9b21-44fe-bda5-2377601dc81&title=)

> **redo log 要写到磁盘，数据也要写磁盘，为什么要多此一举？**

写入 redo log 的方式使用了追加操作， 所以磁盘操作是**顺序写**，而写入数据需要先找到写入位置，然后才写到磁盘，所以磁盘操作是**随机写**。
磁盘的「顺序写 」比「随机写」 高效的多，因此 redo log 写入磁盘的开销更小。
针对「顺序写」为什么比「随机写」更快这个问题，可以比喻为你有一个本子，按照顺序一页一页写肯定比写一个字都要找到对应页写快得多。
可以说这是 WAL 技术的另外一个优点：**MySQL 的写操作从磁盘的「随机写」变成了「顺序写」**，提升语句的执行性能。这是因为 MySQL 的写操作并不是立刻更新到磁盘上，而是先记录在日志上，然后在合适的时间再更新到磁盘上 。
至此， 针对为什么需要 redo log 这个问题我们有两个答案：

- **实现事务的持久性，让 MySQL 有 crash-safe 的能力**，能够保证 MySQL 在任何时间段突然崩溃，重启后之前已提交的记录都不会丢失；
- **将写操作从「随机写」变成了「顺序写」**，提升 MySQL 写入磁盘的性能。

:::success
产生的 redo log 是直接写入磁盘的吗？
:::
不是的。
实际上， 执行一个事务的过程中，产生的 redo log 也不是直接写入磁盘的，因为这样会产生大量的 I/O 操作，而且磁盘的运行速度远慢于内存。
所以，redo log 也有自己的缓存—— **redo log buffer**，每当产生一条 redo log 时，会先写入到 redo log buffer，后续在持久化到磁盘如下图：
![](https://cdn.nlark.com/yuque/0/2024/webp/32717568/1710820061376-b84ded09-2f46-4c43-99b4-3457ad26210c.webp#averageHue=%23f1efec&clientId=u793a5aeb-0dd2-4&from=paste&id=UwjR2&originHeight=1344&originWidth=1398&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u4bd17ff8-82f8-4c61-9591-cf688bceebb&title=)
**redo log buffer** 默认大小** 16 MB**，可以通过 innodb_log_Buffer_size 参数动态的调整大小，增大它的大小可以让 MySQL 处理「大事务」是不必写入磁盘，进而提升写 IO 性能

**redo log 什么时候刷盘？**
缓存在 redo log buffer 里的 redo log 还是在内存中，它什么时候刷新到磁盘？
主要有下面几个时机：

- MySQL 正常关闭时；
- 当 redo log buffer 中记录的写入量大于 redo log buffer 内存空间的一半时，会触发落盘；
- InnoDB 的后台线程每隔 1 秒，将 redo log buffer 持久化到磁盘。
- 每次事务提交时都将缓存在 redo log buffer 里的 redo log 直接持久化到磁盘（这个策略可由 innodb_flush_log_at_trx_commit 参数控制，下面会说）。

**redog log文件写满了怎么办？**
默认情况下， InnoDB 存储引擎有 1 个重做日志文件组( redo log Group），「重做日志文件组」由有 2 个 redo log 文件组成，这两个 redo 日志的文件名叫 ：ib_logfile0 和 ib_logfile1 。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710820230606-abeb3aba-1183-4a65-a348-5986ef6e225d.png#averageHue=%23eeeeee&clientId=u793a5aeb-0dd2-4&from=paste&id=XLcxO&originHeight=101&originWidth=350&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uaa4170ab-826f-466d-be53-401cd0c7352&title=)
在重做日志组中，每个 redo log File 的大小是固定且一致的，假设每个 redo log File 设置的上限是 1 GB，那么总共就可以记录 2GB 的操作。
重做日志文件组是以**循环写**的方式工作的，从头开始写，写到末尾就又回到开头，相当于一个环形。
所以 InnoDB 存储引擎会先写 ib_logfile0 文件，当 ib_logfile0 文件被写满的时候，会切换至 ib_logfile1 文件，当 ib_logfile1 文件也被写满时，会切换回 ib_logfile0 文件。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710820246304-7ea5bc1b-b9e7-4401-982b-8aa722a17322.png#averageHue=%23f6f4ea&clientId=u793a5aeb-0dd2-4&from=paste&id=OnL6o&originHeight=261&originWidth=441&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u7d9df9e2-7a6f-4ff5-ac57-9c98b5e9fbf&title=)
我们知道 redo log 是为了防止 Buffer Pool 中的脏页丢失而设计的，那么如果随着系统运行，Buffer Pool 的脏页刷新到了磁盘中，那么 redo log 对应的记录也就没用了，这时候我们擦除这些旧记录，以腾出空间记录新的更新操作。
redo log 是循环写的方式，相当于一个环形，InnoDB 用 write pos 表示 redo log 当前记录写到的位置，用 checkpoint 表示当前要擦除的位置，如下图：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710820266669-5854c53a-de02-415a-9341-29d624d15d9f.png#averageHue=%23ede7e7&clientId=u793a5aeb-0dd2-4&from=paste&id=XXBKv&originHeight=906&originWidth=1362&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u70e36ffc-1c4f-4df9-88cc-c5256fbb5c8&title=)
图中的：

- write pos 和 checkpoint 的移动都是顺时针方向；
- write pos ～ checkpoint 之间的部分（图中的红色部分），用来记录新的更新操作；
- check point ～ write pos 之间的部分（图中蓝色部分）：待落盘的脏数据页记录；

如果 write pos 追上了 checkpoint，就意味着 **redo log 文件满了，这时 MySQL 不能再执行新的更新操作，也就是说 MySQL 会被阻塞**（_因此所以针对并发量大的系统，适当设置 redo log 的文件大小非常重要_），此时**会停下来将 Buffer Pool 中的脏页刷新到磁盘中，然后标记 redo log 哪些记录可以被擦除，接着对旧的 redo log 记录进行擦除，等擦除完旧记录腾出了空间，checkpoint 就会往后移动（图中顺时针）**，然后 MySQL 恢复正常运行，继续执行新的更新操作。
所以，一次 checkpoint 的过程就是脏页刷新到磁盘中变成干净页，然后标记 redo log 哪些记录可以被覆盖的过程。

<a name="KIrVc"></a>

### binlog

MySQL 在完成一条更新操作后，Server 层还会生成一条 binlog，等之后事务提交的时候，会将该事物执行过程中产生的所有 binlog 统一写 入 binlog 文件。
binlog 文件是记录了所有数据库表结构变更和表数据修改的日志，不会记录查询类的操作，比如 SELECT 和 SHOW 操作。
:::success
**为什么有了 binlog， 还要有 redo log？**
:::
这个问题跟 MySQL 的时间线有关系。
最开始 MySQL 里并没有 InnoDB 引擎，MySQL 自带的引擎是 MyISAM，但是 MyISAM 没有 crash-safe 的能力，binlog 日志只能用于归档。
而 InnoDB 是另一个公司以插件形式引入 MySQL 的，既然只依靠 binlog 是没有 crash-safe 能力的，所以 InnoDB 使用 redo log 来实现 crash-safe 能力。

**这两个日志有四个区别。**
_1、适用对象不同：_

- binlog 是 MySQL 的 Server 层实现的日志，所有存储引擎都可以使用；
- redo log 是 Innodb 存储引擎实现的日志；

_2、文件格式不同：_

- binlog 有 3 种格式类型，分别是 STATEMENT（默认格式）、ROW、 MIXED，区别如下：
  - STATEMENT：每一条修改数据的 SQL 都会被记录到 binlog 中（相当于记录了逻辑操作，所以针对这种格式， binlog 可以称为逻辑日志），主从复制中 slave 端再根据 SQL 语句重现。但 STATEMENT 有动态函数的问题，比如你用了 uuid 或者 now 这些函数，你在主库上执行的结果并不是你在从库执行的结果，这种随时在变的函数会导致复制的数据不一致；
  - ROW：记录行数据最终被修改成什么样了（这种格式的日志，就不能称为逻辑日志了），不会出现 STATEMENT 下动态函数的问题。但 ROW 的缺点是每行数据的变化结果都会被记录，比如执行批量 update 语句，更新多少行数据就会产生多少条记录，使 binlog 文件过大，而在 STATEMENT 格式下只会记录一个 update 语句而已；
  - MIXED：包含了 STATEMENT 和 ROW 模式，它会根据不同的情况自动使用 ROW 模式和 STATEMENT 模式；
- redo log 是物理日志，记录的是在某个数据页做了什么修改，比如对 XXX 表空间中的 YYY 数据页 ZZZ 偏移量的地方做了AAA 更新；

_3、写入方式不同：_

- binlog 是追加写，写满一个文件，就创建一个新的文件继续写，不会覆盖以前的日志，保存的是全量的日志。
- redo log 是循环写，日志空间大小是固定，全部写满就从头开始，保存未被刷入磁盘的脏页日志。

_4、用途不同：_

- binlog 用于备份恢复、主从复制；
- redo log 用于掉电等故障恢复。

**如果不小心整个数据库的数据被删除了，能使用 redo log 文件恢复数据吗？**
不可以使用 redo log 文件恢复，只能使用 binlog 文件恢复。
因为 redo log 文件是循环写，是会边写边擦除日志的，只记录未被刷入磁盘的数据的物理日志，已经刷入磁盘的数据都会从 redo log 文件里擦除。
binlog 文件保存的是全量的日志，也就是保存了所有数据变更的情况，理论上只要记录在 binlog 上的数据，都可以恢复，所以如果不小心整个数据库的数据被删除了，得用 binlog 文件恢复数据。

<a name="syZhI"></a>

### buffer pool

MySQL 的数据都是存在磁盘中的，那么我们要更新一条记录的时候，得先要从磁盘读取该记录，然后在内存中修改这条记录。那修改完这条记录是选择直接写回到磁盘，还是选择缓存起来呢？
当然是缓存起来好，这样下次有查询语句命中了这条记录，直接读取缓存中的记录，就不需要从磁盘获取数据了。
为此，Innodb 存储引擎设计了一个**缓冲池（Buffer Pool）**，来提高数据库的读写性能。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710819543344-a974eb8d-ea5d-4045-be7b-ab5e88549bcf.png#averageHue=%23f1ebd8&clientId=u278da3fc-d7ae-4&from=paste&id=fLMoG&originHeight=969&originWidth=725&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2dd75fea-3a8b-46f9-99e7-7e27ef3d210&title=)
有了 Buffer Poo 后：

- 当读取数据时，如果数据存在于 Buffer Pool 中，客户端就会直接读取 Buffer Pool 中的数据，否则再去磁盘中读取。
- 当修改数据时，如果数据存在于 Buffer Pool 中，那直接修改 Buffer Pool 中数据所在的页，然后将其页设置为脏页（该页的内存数据和磁盘上的数据已经不一致），为了减少磁盘I/O，不会立即将脏页写入磁盘，后续由后台线程选择一个合适的时机将脏页写入到磁盘。

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710819632089-27f4a133-56f2-4202-aa3c-a78e60e48473.png#averageHue=%23f8ebd8&clientId=u278da3fc-d7ae-4&from=paste&id=OMYOM&originHeight=377&originWidth=812&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u61ad4e71-57de-451b-9d8f-815a22ce3d6&title=)

<a name="NAJqU"></a>

### 主从复制的实现

MySQL 的主从复制依赖于** binlog** ，也就是记录 MySQL 上的所有变化并以二进制形式保存在磁盘上。**复制的过程就是将 binlog 中的数据从主库传输到从库上。**
这个过程一般是**异步**的，也就是主库上执行事务操作的线程不会等待复制 binlog 的线程同步完成。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710821238019-db5322f1-daf5-407d-8d85-809d8d5790b6.png#averageHue=%23f7f2e5&clientId=u7103f469-2912-4&from=paste&id=ZD8AH&originHeight=401&originWidth=991&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u3bf46ec8-48b5-4380-8e35-d14167f81cd&title=)

MySQL 集群的主从复制过程梳理成 3 个阶段：

- **写入 Binlog**：主库写 **binlog** 日志，提交事务，并更新本地存储数据。
- **同步 Binlog**：把 **binlog** 复制到所有从库上，每个从库把 **binlog** 写到暂存日志中。
- **回放 Binlog**：回放 **binlog**，并更新存储引擎中的数据。

具体详细过程如下：

- MySQL 主库在收到客户端提交事务的请求之后，会先写入 binlog，再提交事务，更新存储引擎中的数据，事务提交完成后，返回给客户端“操作成功”的响应。
- **从库会创建一个专门的 I/O 线程**，连接主库的 log dump 线程，来接收主库的 binlog 日志，再把 binlog 信息写入 relay log 的中继日志里，再返回给主库“复制成功”的响应。
- **从库会创建一个用于回放 binlog 的线程**，去读 relay log 中继日志，然后回放 binlog 更新存储引擎中的数据，最终实现主从的数据一致性。

在完成主从复制之后，你就可以在写数据时只写主库，在读数据时只读从库，这样即使写请求会锁表或者锁记录，也不会影响读请求的执行。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710821432925-32d16017-cebd-4b53-a2a2-29ac6ef526b0.png#averageHue=%23f8f5f1&clientId=u7103f469-2912-4&from=paste&id=yrn2H&originHeight=471&originWidth=451&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua30031ff-96b5-4e9a-b1df-34a93c59bdc&title=)

**从库是不是越多越好？**
不是的。
因为从库数量增加，从库连接上来的 I/O 线程也比较多，**主库也要创建同样多的 log dump 线程来处理复制的请求，对主库资源消耗比较高，同时还受限于主库的网络带宽**。
所以在实际使用中，一个主库一般跟 2～3 个从库（1 套数据库，1 主 2 从 1 备主），这就是一主多从的 MySQL 集群结构。
**MySQL 主从复制还有哪些模型？**
主要有三种：

- **同步复制**：MySQL 主库提交事务的线程要等待所有从库的复制成功响应，才返回客户端结果。这种方式在实际项目中，基本上没法用，原因有两个：一是性能很差，因为要复制到所有节点才返回响应；二是可用性也很差，主库和所有从库任何一个数据库出问题，都会影响业务。
- **异步复制**（默认模型）：MySQL 主库提交事务的线程并不会等待 binlog 同步到各从库，就返回客户端结果。这种模式一旦主库宕机，数据就会发生丢失。
- **半同步复制**：MySQL 5.7 版本之后增加的一种复制方式，介于两者之间，事务线程不用等待所有的从库复制成功响应，只要一部分复制成功响应回来就行，比如一主二从的集群，只要数据成功复制到任意一个从库上，主库的事务线程就可以返回给客户端。这种**半同步复制的方式，兼顾了异步复制和同步复制的优点，即使出现主库宕机，至少还有一个从库有最新的数据，不存在数据丢失的风险**。

<a name="FUCaG"></a>

### Update过程种三个日志

**三个日志讲完了，至此我们可以先小结下，update 语句的执行过程。**
当优化器分析出成本最小的执行计划后，执行器就按照执行计划开始进行更新操作。
具体更新一条记录 UPDATE t_user SET name = 'xiaolin' WHERE id = 1; 的流程如下:

1. 执行器负责具体执行，会调用存储引擎的接口，通过主键索引树搜索获取 id = 1 这一行记录：
   - 如果 id=1 这一行所在的数据页本来就在 buffer pool 中，就直接返回给执行器更新；
   - 如果记录不在 buffer pool，将数据页从磁盘读入到 buffer pool，返回记录给执行器。
2. 执行器得到聚簇索引记录后，会看一下更新前的记录和更新后的记录是否一样：
   - 如果一样的话就不进行后续更新流程；
   - 如果不一样的话就把更新前的记录和更新后的记录都当作参数传给 InnoDB 层，让 InnoDB 真正的执行更新记录的操作；
3. 开启事务， InnoDB 层更新记录前，首先要记录相应的 undo log，因为这是更新操作，需要把被更新的列的旧值记下来，也就是要生成一条 undo log，undo log 会写入 Buffer Pool 中的 Undo 页面，不过在内存修改该 Undo 页面后，需要记录对应的 redo log。
4. InnoDB 层开始更新记录，会先更新内存（同时标记为脏页），然后将记录写到 redo log 里面，这个时候更新就算完成了。为了减少磁盘I/O，不会立即将脏页写入磁盘，后续由后台线程选择一个合适的时机将脏页写入到磁盘。这就是 **WAL 技术**，MySQL 的写操作并不是立刻写到磁盘上，而是先写 redo 日志，然后在合适的时间再将修改的行数据写到磁盘上。
5. 至此，一条记录更新完了。
6. 在一条更新语句执行完成后，然后开始记录该语句对应的 binlog，此时记录的 binlog 会被保存到 binlog cache，并没有刷新到硬盘上的 binlog 文件，在事务提交时才会统一将该事务运行过程中的所有 binlog 刷新到硬盘。
7. 事务提交，剩下的就是「两阶段提交」的事情了，接下来就讲这个。

<a name="YxsSu"></a>

### 为什么需要两段提交？2PC

事务提交后，**redo log 和 binlog** 都要持久化到磁盘，但是这两个是独立的逻辑，可能出现半成功的状态，这样就造成两份日志之间的逻辑不一致。
举个例子，假设 id = 1 这行数据的字段 name 的值原本是 'jay'，然后执行 UPDATE t_user SET name = 'xiaolin' WHERE id = 1; 如果在持久化 redo log 和 binlog 两个日志的过程中，出现了半成功状态，那么就有两种情况：

- **如果在将 redo log 刷入到磁盘之后， MySQL 突然宕机了，而 binlog 还没有来得及写入**。MySQL 重启后，通过 redo log 能将 Buffer Pool 中 id = 1 这行数据的 name 字段恢复到新值 xiaolin，但是 binlog 里面没有记录这条更新语句，在主从架构中，binlog 会被复制到从库，由于 binlog 丢失了这条更新语句，从库的这一行 name 字段是旧值 jay，与主库的值不一致性；
- **如果在将 binlog 刷入到磁盘之后， MySQL 突然宕机了，而 redo log 还没有来得及写入**。由于 redo log 还没写，崩溃恢复以后这个事务无效，所以 id = 1 这行数据的 name 字段还是旧值 jay，而 binlog 里面记录了这条更新语句，在主从架构中，binlog 会被复制到从库，从库执行了这条更新语句，那么这一行 name 字段是新值 xiaolin，与主库的值不一致性；

可以看到，在持久化 redo log 和 binlog 这两份日志的时候，如果出现半成功的状态，就会造成主从环境的数据不一致性。这是因为 redo log 影响主库的数据，binlog 影响从库的数据，所以 redo log 和 binlog 必须保持一致才能保证主从数据一致。
**MySQL 为了避免出现两份日志之间的逻辑不一致的问题，使用了「两阶段提交」来解决**，两阶段提交其实是分布式事务一致性协议，它可以保证多个逻辑操作要不全部成功，要不全部失败，不会出现半成功的状态。
**两阶段提交把单个事务的提交拆分成了 2 个阶段，分别是「准备（Prepare）阶段」和「提交（Commit）阶段」**，每个阶段都由协调者（Coordinator）和参与者（Participant）共同完成。注意，不要把提交（Commit）阶段和 commit 语句混淆了，commit 语句执行的时候，会包含提交（Commit）阶段。
举个拳击比赛的例子，两位拳击手（参与者）开始比赛之前，裁判（协调者）会在中间确认两位拳击手的状态，类似于问你准备好了吗？

- **准备阶段**：裁判（协调者）会依次询问两位拳击手（参与者）是否准备好了，然后拳击手听到后做出应答，如果觉得自己准备好了，就会跟裁判说准备好了；如果没有自己还没有准备好（比如拳套还没有带好），就会跟裁判说还没准备好。
- **提交阶段**：如果两位拳击手（参与者）都回答准备好了，裁判（协调者）宣布比赛正式开始，两位拳击手就可以直接开打；如果任何一位拳击手（参与者）回答没有准备好，裁判（协调者）会宣布比赛暂停，对应事务中的回滚操作。

<a name="g5hdW"></a>

### 两段提交的过程是怎样的？

在 MySQL 的 InnoDB 存储引擎中，开启 binlog 的情况下，MySQL 会同时维护 binlog 日志与 InnoDB 的 redo log，为了保证这两个日志的一致性，MySQL 使用了**内部 XA 事务**（是的，也有外部 XA 事务，跟本文不太相关，我就不介绍了），内部 XA 事务由 binlog 作为协调者，存储引擎是参与者。
当客户端执行 commit 语句或者在自动提交的情况下，MySQL 内部开启一个 XA 事务，**分两阶段来完成 XA 事务的提交**，如下图：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710821826481-197fe5db-9b02-488a-a319-49a5b199b7b7.png#averageHue=%23cbe88a&clientId=u7103f469-2912-4&from=paste&id=GJgWd&originHeight=842&originWidth=1157&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u0c811a68-c6aa-499a-83a3-8c0735e2d60&title=)
从图中可看出，事务的提交过程有两个阶段，就是**将 redo log 的写入拆成了两个步骤：prepare 和 commit，中间再穿插写入binlog**，具体如下：

- **prepare 阶段**：将 XID（内部 XA 事务的 ID） 写入到 redo log，同时将 redo log 对应的事务状态设置为 prepare，然后将 redo log 持久化到磁盘（innodb_flush_log_at_trx_commit = 1 的作用）；
- **commit 阶段**：把 XID 写入到 binlog，然后将 binlog 持久化到磁盘（sync_binlog = 1 的作用），接着调用引擎的提交事务接口，将 redo log 状态设置为 commit，此时该状态并不需要持久化到磁盘，只需要 write 到文件系统的 page cache 中就够了，因为只要 binlog 写磁盘成功，就算 redo log 的状态还是 prepare 也没有关系，一样会被认为事务已经执行成功；

<a name="jzo8g"></a>

### 异常重启会出现什么现象？ 2段提交

我们来看看在两阶段提交的不同时刻，**MySQL** 异常重启会出现什么现象？下图中有时刻 A 和时刻 B 都有可能发生崩溃：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710821958421-8badab33-4376-44d3-84e0-1b50954de4ca.png#averageHue=%23cce989&clientId=u7103f469-2912-4&from=paste&id=i5hwH&originHeight=842&originWidth=1175&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud2c04f51-6bc8-4b11-80aa-dfc01dd52d6&title=)
不管是时刻 A（redo log 已经写入磁盘， binlog 还没写入磁盘），还是时刻 B （redo log 和 binlog 都已经写入磁盘，还没写入 commit 标识）崩溃，**此时的 redo log 都处于 prepare 状态**。
在 MySQL 重启后会按顺序扫描 redo log 文件，碰到处于 prepare 状态的 redo log，就拿着 redo log 中的 XID 去 binlog 查看是否存在此 XID：

- **如果 binlog 中没有当前内部 XA 事务的 XID，说明 redolog 完成刷盘，但是 binlog 还没有刷盘，则回滚事务**。对应时刻 A 崩溃恢复的情况。
- **如果 binlog 中有当前内部 XA 事务的 XID，说明 redolog 和 binlog 都已经完成了刷盘，则提交事务**。对应时刻 B 崩溃恢复的情况。

可以看到，**对于处于 prepare 阶段的 redo log，即可以提交事务，也可以回滚事务，这取决于是否能在 binlog 中查找到与 redo log 相同的 XID**，如果有就提交事务，如果没有就回滚事务。这样就可以保证 redo log 和 binlog 这两份日志的一致性了。
所以说，**两阶段提交是以 binlog 写成功为事务提交成功的标识**，因为 binlog 写成功了，就意味着能在 binlog 中查找到与 redo log 相同的 XID。
**处于 prepare 阶段的 redo log 加上完整 binlog，重启就提交事务，MySQL 为什么要这么设计?**
binlog 已经写入了，之后就会被从库（或者用这个 binlog 恢复出来的库）使用。
所以，在主库上也要提交这个事务。采用这个策略，主库和备库的数据就保证了一致性。
**事务没提交的时候，redo log 会被持久化到磁盘吗？**
会的。
事务执行中间过程的 redo log 也是直接写在 redo log buffer 中的，这些缓存在 redo log buffer 里的 redo log 也会被「后台线程」每隔一秒一起持久化到磁盘。
也就是说，**事务没提交的时候，redo log 也是可能被持久化到磁盘的**。
有的同学可能会问，如果 mysql 崩溃了，还没提交事务的 redo log 已经被持久化磁盘了，mysql 重启后，数据不就不一致了？
放心，这种情况 mysql 重启会进行回滚操作，因为事务没提交的时候，binlog 是还没持久化到磁盘的。
所以， redo log 可以在事务没提交之前持久化到磁盘，但是 binlog 必须在事务提交之后，才可以持久化到磁盘。

<a name="wJLdI"></a>

### 两段提交有什么问题？

两阶段提交虽然保证了两个日志文件的数据一致性，但是性能很差，主要有两个方面的影响：

- **磁盘 I/O 次数高**：对于“双1”配置，每个事务提交都会进行两次 fsync（刷盘），一次是 redo log 刷盘，另一次是 binlog 刷盘。
- **锁竞争激烈**：两阶段提交虽然能够保证「单事务」两个日志的内容一致，但在「多事务」的情况下，却不能保证两者的提交顺序一致，因此，在两阶段提交的流程基础上，还需要加一个锁来保证提交的原子性，从而保证多事务的情况下，两个日志的提交顺序一致。

为什么两阶段提交的磁盘 I/O 次数会很高？
binlog 和 redo log 在内存中都对应的缓存空间，binlog 会缓存在 binlog cache，redo log 会缓存在 redo log buffer，它们持久化到磁盘的时机分别由下面这两个参数控制。一般我们为了避免日志丢失的风险，会将这两个参数设置为 1：

- 当 sync_binlog = 1 的时候，表示每次提交事务都会将 binlog cache 里的 binlog 直接持久到磁盘；
- 当 innodb_flush_log_at_trx_commit = 1 时，表示每次事务提交时，都将缓存在 redo log buffer 里的 redo log 直接持久化到磁盘；

可以看到，如果 sync_binlog 和 当 innodb_flush_log_at_trx_commit 都设置为 1，那么在每个事务提交过程中， 都会**至少调用 2 次刷盘操作**，一次是 redo log 刷盘，一次是 binlog 落盘，所以这会成为性能瓶颈。
为什么锁竞争激烈？
在早期的 MySQL 版本中，通过使用 prepare_commit_mutex 锁来保证事务提交的顺序，在一个事务获取到锁时才能进入 prepare 阶段，一直到 commit 阶段结束才能释放锁，下个事务才可以继续进行 prepare 操作。
通过加锁虽然完美地解决了顺序一致性的问题，但在并发量较大的时候，就会导致对锁的争用，性能不佳。

<a name="yKSN4"></a>

### **减少磁盘IO次数的 组提交**

**MySQL 引入了 binlog 组提交（group commit）机制，当有多个事务提交的时候，会将多个 binlog 刷盘操作合并成一个，从而减少磁盘 I/O 的次数**，如果说 10 个事务依次排队刷盘的时间成本是 10，那么将这 10 个事务一次性一起刷盘的时间成本则近似于 1。
引入了组提交机制后，prepare 阶段不变，只针对 commit 阶段，将 commit 阶段拆分为三个过程：

- **flush 阶段**：多个事务按进入的顺序将 binlog 从 cache 写入文件（不刷盘）；
- **sync 阶段**：对 binlog 文件做 fsync 操作（多个事务的 binlog 合并一次刷盘）；
- **commit 阶段**：各个事务按顺序做 InnoDB commit 操作；

上面的**每个阶段都有一个队列**，每个阶段有锁进行保护，因此保证了事务写入的顺序，第一个进入队列的事务会成为 leader，leader领导所在队列的所有事务，全权负责整队的操作，完成后通知队内其他事务操作结束。

对每个阶段引入了队列后，锁就只针对每个队列进行保护，不再锁住提交事务的整个过程，可以看的出来，**锁粒度减小了，这样就使得多个阶段可以并发执行，从而提升效率**。
有 binlog 组提交，那有 redo log 组提交吗？
这个要看 MySQL 版本，MySQL 5.6 没有 redo log 组提交，MySQL 5.7 有 redo log 组提交。
在 MySQL 5.6 的组提交逻辑中，每个事务各自执行 prepare 阶段，也就是各自将 redo log 刷盘，这样就没办法对 redo log 进行组提交。
所以在 MySQL 5.7 版本中，做了个改进，在 prepare 阶段不再让事务各自执行 redo log 刷盘操作，而是推迟到组提交的 flush 阶段，也就是说 prepare 阶段融合在了 flush 阶段。
这个优化是将 redo log 的刷盘延迟到了 flush 阶段之中，sync 阶段之前。通过延迟写 redo log 的方式，为 redolog 做了一次组写入，这样 binlog 和 redo log 都进行了优化。
接下来介绍每个阶段的过程，注意下面的过程针对的是“双 1” 配置（sync_binlog 和 innodb_flush_log_at_trx_commit 都配置为 1）。
flush 阶段
第一个事务会成为 flush 阶段的 Leader，此时后面到来的事务都是 Follower ：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710822088669-e096b04f-0544-43d6-942e-842451b656ca.png#averageHue=%23fefefe&clientId=u7103f469-2912-4&from=paste&id=le5Ku&originHeight=862&originWidth=1192&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ub6906294-274f-4d50-bf5a-d574c96a594&title=)
接着，获取队列中的事务组，由绿色事务组的 Leader 对 redo log 做一次 write + fsync，即一次将同组事务的 redolog 刷盘：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710822101387-3fc6a60f-1b27-42c0-bf16-0ebeb4da11f8.png#averageHue=%23fdfefb&clientId=u7103f469-2912-4&from=paste&id=kTN1F&originHeight=494&originWidth=1144&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u7286124c-0315-4f91-a104-9957fc85e5b&title=)
完成了 prepare 阶段后，将绿色这一组事务执行过程中产生的 binlog 写入 binlog 文件（调用 write，不会调用 fsync，所以不会刷盘，binlog 缓存在操作系统的文件系统中）。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710822117805-9a9e5c5f-d9f2-4de8-9d29-89e16dbdefea.png#averageHue=%23fdfefa&clientId=u7103f469-2912-4&from=paste&id=B8r0x&originHeight=478&originWidth=1392&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uff08c8cc-ef39-4492-9da2-c2f974db97c&title=)
从上面这个过程，可以知道 flush 阶段队列的作用是**用于支撑 redo log 的组提交**。
如果在这一步完成后数据库崩溃，由于 binlog 中没有该组事务的记录，所以 MySQL 会在重启后回滚该组事务。
sync 阶段
绿色这一组事务的 binlog 写入到 binlog 文件后，并不会马上执行刷盘的操作，而是**会等待一段时间**，这个等待的时长由 Binlog_group_commit_sync_delay 参数控制，**目的是为了组合更多事务的 binlog，然后再一起刷盘**，如下过程：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710822131020-f4871de1-89ab-4ca0-b488-2250a6fad10a.png#averageHue=%23fefefe&clientId=u7103f469-2912-4&from=paste&id=MFFjx&originHeight=1876&originWidth=1268&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u4c7c8107-68c5-4faa-a597-90525752663&title=)
不过，在等待的过程中，如果事务的数量提前达到了 Binlog_group_commit_sync_no_delay_count 参数设置的值，就不用继续等待了，就马上将 binlog 刷盘，如下图：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710822131098-14bc1418-325f-4883-a39b-426817da6fc8.png#averageHue=%23faf8ef&clientId=u7103f469-2912-4&from=paste&id=ic1fV&originHeight=702&originWidth=1910&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u2bf01ba4-4b6b-4834-b8d1-038dd92f3d7&title=)
从上面的过程，可以知道 sync 阶段队列的作用是**用于支持 binlog 的组提交**。
如果想提升 binlog 组提交的效果，可以通过设置下面这两个参数来实现：

- binlog_group_commit_sync_delay= N，表示在等待 N 微妙后，直接调用 fsync，将处于文件系统中 page cache 中的 binlog 刷盘，也就是将「 binlog 文件」持久化到磁盘。
- binlog_group_commit_sync_no_delay_count = N，表示如果队列中的事务数达到 N 个，就忽视binlog_group_commit_sync_delay 的设置，直接调用 fsync，将处于文件系统中 page cache 中的 binlog 刷盘。

如果在这一步完成后数据库崩溃，由于 binlog 中已经有了事务记录，MySQL会在重启后通过 redo log 刷盘的数据继续进行事务的提交。
commit 阶段
最后进入 commit 阶段，调用引擎的提交事务接口，将 redo log 状态设置为 commit。
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710822131060-5a8acea3-1383-4aa6-8462-8210ae2f9cac.png#averageHue=%23fefefe&clientId=u7103f469-2912-4&from=paste&id=kJwfN&originHeight=1107&originWidth=1020&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u5d861b6b-e70e-4fe8-8064-3b704d8860f&title=)
commit 阶段队列的作用是承接 sync 阶段的事务，完成最后的引擎提交，使得 sync 可以尽早的处理下一组事务，最大化组提交的效率。

<a name="vhPup"></a>

### MySQL磁盘I/O 很高，有什么优化的方法？

现在我们知道事务在提交的时候，需要将 binlog 和 redo log 持久化到磁盘，那么如果出现 MySQL 磁盘 I/O 很高的现象，我们可以通过控制以下参数，来 “延迟” binlog 和 redo log 刷盘的时机，从而降低磁盘 I/O 的频率：

- 设置组提交的两个参数： binlog_group_commit_sync_delay 和 binlog_group_commit_sync_no_delay_count 参数，延迟 binlog 刷盘的时机，从而减少 binlog 的刷盘次数。这个方法是基于“额外的故意等待”来实现的，因此可能会增加语句的响应时间，但即使 MySQL 进程中途挂了，也没有丢失数据的风险，因为 binlog 早被写入到 page cache 了，只要系统没有宕机，缓存在 page cache 里的 binlog 就会被持久化到磁盘。
- 将 sync_binlog 设置为大于 1 的值（比较常见是 100~1000），表示每次提交事务都 write，但累积 N 个事务后才 fsync，相当于延迟了 binlog 刷盘的时机。但是这样做的风险是，主机掉电时会丢 N 个事务的 binlog 日志。
- 将 innodb_flush_log_at_trx_commit 设置为 2。表示每次事务提交时，都只是缓存在 redo log buffer 里的 redo log 写到 redo log 文件，注意写入到「 redo log 文件」并不意味着写入到了磁盘，因为操作系统的文件系统中有个 Page Cache，专门用来缓存文件数据的，所以写入「 redo log文件」意味着写入到了操作系统的文件缓存，然后交由操作系统控制持久化到磁盘的时机。但是这样做的风险是，主机掉电的时候会丢数据。

<a name="TJ1bb"></a>

## 一条Update语句流程

具体更新一条记录 UPDATE t_user SET name = 'xiaolin' WHERE id = 1; 的流程如下:

1. **执行器负责具体执行**，会调用存储引擎的接口，通过主键索引树搜索获取 id = 1 这一行记录：
   - 如果 id=1 这一行所在的数据页本来就在 buffer pool 中，就直接返回给执行器更新；
   - 如果记录不在 buffer pool，将数据页从磁盘读入到 buffer pool，返回记录给执行器。
2. 执行器得到聚簇索引记录后，会看一下更新前的记录和更新后的记录是否一样：
   - 如果一样的话就不进行后续更新流程；
   - 如果不一样的话就把更新前的记录和更新后的记录都当作参数传给 InnoDB 层，让 InnoDB 真正的执行更新记录的操作；
3. **开启事务**， InnoDB 层更新记录前，首先要记录相应的 undo log，因为这是更新操作，需要把被更新的列的旧值记下来，也就是要生成一条 undo log，undo log 会写入 Buffer Pool 中的 Undo 页面，不过在内存修改该 Undo 页面后，需要记录对应的 redo log。
4. **InnoDB 层开始更新记录**，会先更新内存（同时标记为脏页），然后将记录写到 redo log 里面，这个时候更新就算完成了。为了减少磁盘I/O，不会立即将脏页写入磁盘，后续由后台线程选择一个合适的时机将脏页写入到磁盘。这就是 **WAL 技术**，MySQL 的写操作并不是立刻写到磁盘上，而是先写 redo 日志，然后在合适的时间再将修改的行数据写到磁盘上。
5. 至此，一条记录更新完了。
6. 在一条更新语句执行完成后，然后开始记录该语句对应的** binlog**，此时记录的 binlog 会被保存到 binlog cache，并没有刷新到硬盘上的 binlog 文件，在事务提交时才会统一将该事务运行过程中的所有 binlog 刷新到硬盘。
7. **事务提交**（为了方便说明，这里不说组提交的过程，只说两阶段提交）：
   - **prepare 阶段**：将 redo log 对应的事务状态设置为 prepare，然后将 redo log 刷新到硬盘；
   - **commit 阶段**：将 binlog 刷新到磁盘，接着调用引擎的提交事务接口，将 redo log 状态设置为 commit（将事务设置为 commit 状态后，刷入到磁盘 redo log 文件）；
8. 至此，一条更新语句执行完成。

<a name="v9kCE"></a>

## explain各个字段的意思

explain执行计划中包含的信息如下：

- id:  查询序列号
- **select_type: 查询类型**
- table: 表名或者别名
- partitions: 匹配的分区
- type: 访问类型
- possible_keys: 可能用到的索引
- **key: 实际用到的索引**
- key_len: 索引长度
- ref: 与索引比较的列
- rows: 估算的行数
- filtered: 按表条件筛选的行百分比
- **Extra: 额外信息**

<a name="PDVib"></a>

# 聊一聊项目中用到的grpc

RPC 远程过程调用 通过RPC进行通信，让调用远程函数就像调用本地函数一样

gRPC是RPC的一种，由Google提出，
gRPC典型特征就是使用 protobuf 座位接口定义语言 IDL。

1. **grpc是什么？有哪些优点**

gRPC是一种高性能、开源的远程过程调用（RPC）框架，它可以使不同平台和语言之间的服务相互通信。它的优点包括：高效性、跨平台、异步流处理、支持多种语言、安全、易于使用和开源。

2. **gPRC和REST的区别是什么？**

REST是基于HTTP协议的一种风格，而gRPC是一个独立于协议的RPC框架。 REST基于资源的状态转移，使用标准的HTTP方法，而gRPC使用协议缓冲区（Protocol Buffers）进行序列化和反序列化。 gRPC支持异步流处理和双向流，而REST通常只支持请求/响应模式。

3. **Protocol Buffers是什么，为什么它被用于gRPC中？**

Protocol Buffers是一种语言中立、平台中立、可扩展的序列化格式，它可以用于数据交换和持久化。它被用于gRPC中，因为它可以实现高效的序列化和反序列化，从而提高了gRPC的性能和效率。**

4. **gPRC的流程是什么？**

gRPC流程分为四个步骤：定义服务、生成源代码、实现服务、启动服务。首先，需要定义要实现的服务及其接口，使用Protocol Buffers编写接口定义文件。其次，使用编译器生成客户端和服务器端的源代码。然后，实现生成的接口。最后，启动服务器并将其部署在适当的位置。
****5. gRPC支持哪些类型的序列化？**
gRPC支持两种类型的序列化：二进制（使用Protocol Buffers）和JSON。其中，二进制序列化在效率和性能方面比JSON序列化更优秀。但是，JSON序列化在可读性方面更好，可以方便地进行调试和测试。
<a name="a8jwk"></a>

# 分布式

<a name="WOOxj"></a>

## CAP理论

> 在[理论计算机科学](https://zh.m.wikipedia.org/wiki/%E7%90%86%E8%AB%96%E8%A8%88%E7%AE%97%E6%A9%9F%E7%A7%91%E5%AD%B8)中，**CAP定理**（CAP theorem），又被称作**布鲁尔定理**（Brewer's theorem），它指出对于一个[分布式计算系统](https://zh.m.wikipedia.org/wiki/%E5%88%86%E5%B8%83%E5%BC%8F%E8%AE%A1%E7%AE%97)来说，[不可能同时满足以下三点](https://zh.m.wikipedia.org/wiki/%E4%B8%89%E9%9A%BE%E5%9B%B0%E5%A2%83)：[[1]](https://zh.m.wikipedia.org/wiki/CAP%E5%AE%9A%E7%90%86#cite_note-Lynch-1)[[2]](https://zh.m.wikipedia.org/wiki/CAP%E5%AE%9A%E7%90%86#cite_note-2)
>
> - 一致性（**C**onsistency） （等同于所有节点访问同一份最新的数据副本）
> - [可用性](https://zh.m.wikipedia.org/wiki/%E5%8F%AF%E7%94%A8%E6%80%A7)（**A**vailability）（每次请求都能获取到非错的响应——---但是不保证获取的数据为最新数据）
> - [分区容错性](https://zh.m.wikipedia.org/w/index.php?title=%E7%BD%91%E7%BB%9C%E5%88%86%E5%8C%BA&action=edit&redlink=1)（**P**artition tolerance）（以实际效果而言，分区相当于对通信的时限要求。系统如果不能在时限内达成数据一致性，就意味着发生了分区的情况，必须就当前操作在C和A之间做出选择[[3]](https://zh.m.wikipedia.org/wiki/CAP%E5%AE%9A%E7%90%86#cite_note-3)。）

根据定理，分布式系统只能满足三项中的两项而不可能满足全部三项[[4]](https://zh.m.wikipedia.org/wiki/CAP%E5%AE%9A%E7%90%86#cite_note-4)。理解CAP理论的最简单方式是想象两个节点分处分区两侧。允许至少一个节点更新状态会导致数据不一致，即丧失了C性质。如果为了保证数据一致性，将分区一侧的节点设置为不可用，那么又丧失了A性质。除非两个节点可以互相通信，才能既保证C又保证A，这又会导致丧失P性质。

<a name="FeBPw"></a>

## 分布式锁的使用场景

1. **缓存击穿保护**： 当缓存中的某个热点数据过期失效时，多台服务器上的请求可能会同时穿透缓存直接访问数据库，造成数据库压力过大甚至崩溃。通过使用分布式锁，仅允许一个请求去更新缓存，其他请求等待锁释放后再读取已更新的缓存数据。
2. **限流控制**： 在高并发环境下，为了防止系统被瞬时大量请求压垮，可以使用分布式锁作为令牌桶或漏桶算法的一部分，限制同一时刻能够执行特定操作的并发数。
3. **分布式任务调度**： 在分布式系统中，确保某些任务只执行一次，比如定时任务或一次性初始化任务，可以通过分布式锁确保只有一个节点获得执行权限。
4. **分布式事务一致性**： 在分布式事务中，为保证多服务协同修改共享资源的一致性，分布式锁可用于协调跨多个数据库或服务的操作顺序，实现类似于两阶段提交（2PC）或多阶段提交的逻辑。
5. **防止并发竞争条件**： 在多节点环境下，若多个节点可能同时访问同一资源（如数据库行、文件、全局ID生成器等），为避免并发冲突导致的数据不一致，分布式锁可以用来保护关键资源的访问，确保同一时刻只有一个节点对其进行操作。
6. **分布式队列消费**： 在消息队列处理中，为防止同一条消息被多个消费者重复消费，可以利用分布式锁确保每条消息只被一个消费者领取并处理。
7. **游戏排行榜实时更新**： 在网络游戏场景中，每当玩家得分发生变化时，需要实时更新排行榜。为了避免多台服务器同时更新排行榜产生数据混乱，可以使用分布式锁确保同一时间只有一个更新操作生效。

<a name="YycDU"></a>

## 2段提交和3端提交以及 TTC

2pc
3pc
ttc

所谓的两个阶段是指：

- 第一阶段：voting phase **投票阶段**
- 第二阶段：commit phase **提交阶段**

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710893211441-651fa440-91db-4cc7-aedb-f3f2a91b8701.png#averageHue=%23edf0f3&clientId=u93083698-3bc5-4&from=paste&id=Ycp9a&originHeight=147&originWidth=586&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=14131&status=done&style=none&taskId=ue46bc0a2-7c3a-46a7-97d9-ab597aea6ab&title=)

事务**协调者**给每个**参与者**发送**Prepare消息**，每个参与者**要么直接返回失败**(如权限验证失败)，**要么在本地执行事务，写本地的redo和undo日志，但不提交**，到达一种“万事俱备，只欠东风”的状态。

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710893243750-d9c580be-b7c6-413e-b79a-7dbff6f74ec7.png#averageHue=%23ebeff2&clientId=u93083698-3bc5-4&from=paste&id=R0ctP&originHeight=194&originWidth=586&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u6648762c-7a70-4daf-afd8-826dadd8e51&title=)

> 三阶段提交（Three-phase commit），也叫三阶段提交协议（Three-phase commit protocol），是二阶段提交（2PC）的改进版本。

![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710893284925-b7a262be-5705-40e7-a9d1-07a86a9a38e6.png#averageHue=%23f1f4f6&clientId=u93083698-3bc5-4&from=paste&id=hV4VE&originHeight=201&originWidth=478&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u9437af21-3c14-4cc3-9895-fa7e22e9059&title=)
也就是说，除了引入超时机制之外，3PC把**2PC的投票阶段再次一分为二**，这样三阶段提交就有CanCommit、PreCommit、DoCommit三个阶段。

TCC 指的就是 Try、Confirm、Cancel 三个操作，基本类似两阶段提交。由事务管理方发起向所有参与者发起 try 请求，根据 try 请求的结果决定全部 confirm 或是全部 cancel。
TCC 框架一般需要使用数据库持久化记录事务数据，跟踪整个事务的执行状态，并在事务失败后补偿重试。具有一定的容灾能力。

在 TCC 框架内，所有的参与者的业务逻辑都需按照二阶段设计。一阶段锁定和预备资源、二阶段执行提交（confirm）或释放资源（cancel）。

<a name="UfDyd"></a>

## Raft算法和Paxos共识性算法的步骤

**Raft算法**
Raft共识算法是一种用于在分布式系统中实现一致性状态机复制的协议，它通过一系列有序步骤确保了集群中的节点能够达成一致。以下是Raft算法的基本步骤概述：
1.** 领导者选举（Leader Election）：**

- 在Raft中，所有节点初始时处于跟随者（Follower）状态。
- 每个跟随者都有一个随机的选举超时时间，在超时后会变成候选人（Candidate）状态，并开始新的选举轮次。
- 候选人向其他节点发送请求投票的消息，收到大多数节点（包括自己）的投票后，该候选人成为领导者（Leader）。
- 如果一个任期内没有候选人在规定时间内获得多数票，则重新进入选举过程。

2.** 日志复制（Log Replication）**：

- 领导者负责接收来自客户端的所有写入请求，并将这些请求作为日志条目追加到自己的日志中。
- 领导者按顺序将新日志条目复制到跟随者节点上，通过AppendEntries RPC调用完成。
- 跟随者必须响应领导者并确认它们已经正确地将日志条目附加到了本地日志中，并遵循领导者的日志完整性约束（如日志索引和任期号匹配）。

3. **提交日志（Log Commitment）：**

- 当一条日志条目已经被复制到大多数节点上时，领导者认为这条日志是已提交（committed），意味着它可以安全地应用于状态机进行状态更新。
- 领导者通知跟随者可以提交特定的日志条目，跟随者根据领导者的指示更新其已提交日志的边界。

4. **安全性保证（Safety）**：

- Raft确保不会出现同一索引位置有两个不同的日志条目（通过领导者的强领导力和日志匹配规则来实现）。
- 即使发生领导人变更，新的领导人也只会提交已经复制到大多数节点上的日志条目，以确保在整个集群中的一致性。

5. **集群成员变更（Membership Changes）**：

- Raft还定义了一种机制来安全地更改集群的成员资格，即添加或移除节点，这个过程同样需要在领导者控制下按照严格的协议执行。

通过上述步骤，Raft能够在面临网络分区、消息丢失等故障的情况下保持集群的一致性和可用性。

**Paxos算法**
Paxos算法是一种分布式一致性算法，它用于解决在存在网络延迟、部分节点失效等异步环境下的共识问题。Paxos通常被描述为具有多个阶段，以确保即使在网络不稳定的情况下也能达成一致的决策（例如选择一个提案）。以下是简化版的两阶段Paxos过程：

1. **准备阶段 (Prepare Phase)**:
   - **Proposer** 选择一个新的提案编号 N。
   - Proposer 向集群中的大多数 **Acceptor** 发送一个 Prepare Request (N)，其中包含这个提议编号 N。
   - 如果一个 Acceptor 收到一个编号大于其之前已经响应过的任何 Prepare 请求的编号 N，则它会：
     - 承诺不再接受编号小于 N 的提案。
     - 如果它之前已经接受了某个提案，则回复 Proposer 已经接受的提案值及其对应的提案编号（如果有）。
2. **接受阶段 (Accept Phase)**:
   - 当 Proposer 收到来自大多数 Acceptor 对于其 Prepare 请求 N 的确认后，它可以进入 Accept 阶段。
   - Proposer 会选择一个值来提出（可能是从收到的 Acceptor 回复中已接受的最高编号提案的值，如果没有这样的值，则由 Proposer 自行决定一个值）。
   - Proposer 向大多数 Acceptor 发送 Accept Request (N, Value)，包括提案编号 N 和选定的值 Value。
   - 如果一个 Acceptor 收到一个提案，并且该提案的编号 N 是它所承诺过的（即，它没有对更高编号的 Prepare 请求做出过承诺），那么它将接受这个提案并回复确认。
3. **学习阶段 (Learn Phase / Commit Phase)**:
   - 当 Proposer 收到了大多数 Acceptor 对其提案 N 的确认后，意味着提案已经被“接受”（accepted）了，因为大多数 Acceptor 都同意了同一个提案值。
   - 这时，该提案可以被认为已被“提交”（committed），也就是说，它是最终的决策。
   - Proposer 通知所有 Learner（通常是系统中的其他节点或客户端），告诉他们提案 N 的值已被确定，Learner 根据接收到的通知更新状态。

Paxos算法的关键在于，只有当一个提案获得了大多数 Acceptor 的批准后，才能被认为是有效的。通过这种方式，即使部分节点失败或消息丢失，系统仍然能够保证安全性和最终一致性。实际应用中，为了提高效率和应对复杂场景，Paxos可能会扩展成多轮投票或者优化为更高效的变种，如 Multi-Paxos 或 Fast Paxos 等。

区别：
Raft算法的优点与缺点：
Raft算法和Paxos算法都是分布式一致性算法，用于在分布式系统中达成共识并确保数据的一致性。尽管它们解决的问题相同，但在设计哲学、实现复杂度和易理解性方面存在显著差异：
**Raft算法的特点与优势：**

1. **易于理解与实现**：Raft算法的设计目标之一就是清晰性和易理解性，它将复杂的共识过程分解为几个明确的子模块，如领导者选举、日志复制和安全性保证等，并且每个步骤都有详细的伪代码描述。
2. **领导者的强化角色**：Raft协议强调一个强领导（Leader）的概念，系统在任何时刻都只有一个明确的领导者负责处理客户端请求和日志同步。
3. **日志复制简化**：Raft通过日志连续性来简化了状态机复制的过程，确保领导者的日志总是最新的，并且严格要求所有节点按相同的顺序复制日志条目。当新领导者被选举出来时，它已经包含了所有已提交的日志条目。
4. **明确定义的状态机转移**：Raft将一致性算法划分为三种明确的角色状态（Follower、Candidate、Leader）以及几种明确的转换条件，使协议流程更加直观。

**Paxos算法的特点：**

1. **理论基础深厚**：Paxos由Leslie Lamport提出，其初衷是解决非常理论化的一致性问题，对于工程实践中的具体实现较为抽象。
2. **多阶段过程**：原始的Paxos算法通常需要两个或更多的阶段（Prepare、Promise、Accept、Learn），并且为了提高效率，在实际应用中往往采用Multi-Paxos变种，该变种在一个领导者持续存在的前提下简化了多个提案的处理。
3. **更灵活但较难理解**：Paxos允许更为灵活的领导者变更和日志结构，比如日志可能存在空洞，但这也导致了在实现时可能遇到的复杂性增加，特别是在理解和调试阶段。
4. **没有明确的角色划分**：Paxos中的角色功能不如Raft那样明确分离，例如Proposer和Acceptor的角色可以在不同的提议过程中重叠，增加了理解和实施的难度。

总结起来，Raft相对于Paxos的主要区别在于：

- Raft通过简化的设计使其更容易实现和教学；
- Raft对领导者的管理更为明确和单一，从而降低了复杂性；
- Raft的日志管理规则比Paxos更为严格，以减少不一致性的可能性；
- Paxos在理论上更为通用和灵活，而Raft则牺牲了一定的灵活性换取了更高的可操作性和可维护性。

<a name="JVXna"></a>

## 一致性Hash算法

[https://xiaolincoding.com/os/8_network_system/hash.html#%E5%A6%82%E4%BD%95%E5%88%86%E9%85%8D%E8%AF%B7%E6%B1%82](https://xiaolincoding.com/os/8_network_system/hash.html#%E5%A6%82%E4%BD%95%E5%88%86%E9%85%8D%E8%AF%B7%E6%B1%82)

**Hash算法分配的问题。**

- **虚拟结点**
- **分布均匀**
- 16384个槽位

不同的负载均衡算法适用的业务场景也不同的。
轮询这类的策略只能适用与每个节点的数据都是相同的场景，访问任意节点都能请求到数据。但是不适用分布式系统，因为分布式系统意味着数据水平切分到了不同的节点上，访问数据的时候，一定要寻址存储该数据的节点。
哈希算法虽然能建立数据和节点的映射关系，但是每次在节点数量发生变化的时候，最坏情况下所有数据都需要迁移，这样太麻烦了，所以不适用节点数量变化的场景。
为了减少迁移的数据量，就出现了一致性哈希算法。
一致性哈希是指将「存储节点」和「数据」都映射到一个首尾相连的哈希环上，如果增加或者移除一个节点，仅影响该节点在哈希环上顺时针相邻的后继节点，其它数据也不会受到影响。
但是一致性哈希算法不能够均匀的分布节点，会出现大量请求都集中在一个节点的情况，在这种情况下进行容灾与扩容时，容易出现雪崩的连锁反应。
为了解决一致性哈希算法不能够均匀的分布节点的问题，就需要引入虚拟节点，对一个真实节点做多个副本。不再将真实节点映射到哈希环上，而是将虚拟节点映射到哈希环上，并将虚拟节点映射到实际节点，所以这里有「两层」映射关系。
引入虚拟节点后，可以会提高节点的均衡度，还会提高系统的稳定性。所以，带虚拟节点的一致性哈希方法不仅适合硬件配置不同的节点的场景，而且适合节点规模会发生变化的场景。

<a name="QRmI3"></a>

# 操作系统

<a name="Q5FmL"></a>

## CPU缓存一致性

由于CPU和内存的访问性能相差比较大，引入了 CPU Cache（高速缓存）
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709429174160-7cee551e-fbfe-4aa2-80d4-85a997d28520.png#averageHue=%23f9e0c3&clientId=ue55a4749-38fd-4&from=paste&height=533&id=duCIL&originHeight=666&originWidth=1006&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=114117&status=done&style=none&taskId=u5bcec540-e10c-44ed-8904-4f2b5783ff0&title=&width=804.8)

写入缓存后，什么时候将 缓存写回内存

- 写直达（Write Through）：把数据同时写入内存和Cache（每次都要写回内存，操作费时）
- 写回（Write Back）：新数据仅仅写入Cache Block，只有在被修改时才写回内存

写回策略：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709430101470-9d86d27d-34bb-4c70-99ed-6334924e9e7e.png#averageHue=%23fbfaf5&clientId=ue55a4749-38fd-4&from=paste&height=858&id=cFC5z&originHeight=1073&originWidth=849&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=268631&status=done&style=none&taskId=uf6fd2362-03dc-4994-8362-2b4c3e8c9e8&title=&width=679.2)

什么是缓存不一致问题？
由于现在的CPU基本都是多核的，那么会带来多核的缓存不一致问题。

解决思路：

- 第一点，某个 CPU 核心里的 Cache 数据更新时，必须要传播到其他核心的 Cache，这个称为**写传播（_Write Propagation_）**；
- 第二点，某个 CPU 核心里对数据的操作顺序，必须在其他核心看起来顺序是一样的，这个称为**事务的串行化（_Transaction Serialization_）**。

实现事务的串行化：

- CPU 核心对于 Cache 中数据的操作，需要同步给其他 CPU 核心；
- 要引入「锁」的概念，如果两个 CPU 核心里有相同数据的 Cache，那么对于这个 Cache 数据的更新，只有拿到了「锁」，才能进行对应的数据更新。

基于总线嗅探机制的 MESI 协议，就满足上面了这两点，因此它是保障缓存一致性的协议。
MESI 协议，是已修改、独占、共享、已失效这四个状态
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709431032972-304e040d-4fd9-48dd-bcd8-573f753e893f.png#averageHue=%23fcf8f2&clientId=ue55a4749-38fd-4&from=paste&height=430&id=UMVFb&originHeight=538&originWidth=824&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=155756&status=done&style=none&taskId=ue484635c-b7e1-4dbe-b0b1-691b11223cd&title=&width=659.2)

<a name="cpmnu"></a>

## CPU如何选择线程？

实时任务 > 普通任务

CFS调度: 一种相对公平的调度策略，希望给每个线程相同的运行时间
vruntime += 运行时间*nice / 权重
每个CPU都会有自己的运行队列（Run Queue，rq）
nice值 （-20--19）
priority优先级(0--139)
优先级（new） = 优先级（old）+ nice

<a name="AoVjG"></a>

## 什么是软中断

**中断**：操作系统为了响应硬件设备的请求，操作系统收到硬件的中断请求，会打断正在运行的进程，然后调用内核中的中断处理程序来响应请求。

中断处理程序的上部分和下半部可以理解为：

- **上半部直接处理硬件请求，也就是硬中断**，主要是负责耗时短的工作，特点是快速执行；
- **下半部是由内核触发，也就说软中断**，主要是负责上半部未完成的工作，通常都是耗时比较长的事情，特点是延迟执行；

Linux 中的软中断包括网络收发、定时、调度、RCU 锁等各种类型

<a name="ByJQ4"></a>

## 聊一聊虚拟内存

<a name="zdLrN"></a>

### 操作系统的保护模式和实模式

- **实模式**将整个物理内存看成分段的区域，程序代码和数据位于不同区域，系统程序和用户程序并没有区别对待，而且每一个指针都是指向实际的物理地址。这样一来，用户程序的一个指针如果指向了系统程序区域或其他用户程序区域，并修改了内容，那么对于这个被修改的系统程序或用户程序，其后果就很可能是灾难性的。再者，随着软件的发展，1M的寻址空间已经远远不能满足实际的需求了。最后，对处理器多任务支持需求也日益紧迫，所有这些都促使新技术的出现。
- 为了克服实模式下的内存非法访问问题，并满足飞速发展的内存寻址和多任务需求，处理器厂商开发出**保护模式**。在保护模式中，除了内存寻址空间大大提高；提供了硬件对多任务的支持；**物理内存地址也不能直接被程序访问，程序内部的地址(虚拟地址)要由操作系统转化为物理地址去访问，程序对此一无所知**。至此，进程(程序的运行态)有了严格的边界，任何其他进程根本没有办法访问不属于自己的物理内存区域，甚至在自己的虚拟地址范围内也不是可以任意访问的，因为有一些虚拟区域已经被放进一些公共系统运行库。这些区域也不能随便修改，若修改就会有出现linux中的段错误，或Windows中的非法内存访问对话框。

<a name="OHf3j"></a>

### 虚拟内存，它的内存布局大概是什么样子的？

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709434070467-8ad486d6-7b50-4daa-97bd-08966e678e8b.png#averageHue=%23f7f5f2&clientId=ue55a4749-38fd-4&from=paste&height=601&id=kUodC&originHeight=751&originWidth=639&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=85336&status=done&style=none&taskId=u7f5f0f3c-56c9-4237-857c-70b9182bd14&title=&width=511.2)

- 我们程序所使用的内存地址叫做**虚拟内存地址**（_Virtual Memory Address_）
- 实际存在硬件里面的空间地址叫**物理内存地址**（_Physical Memory Address_）。

**虚拟地址**是操作系统给将内存的物理地址映射成一块虚拟地址分配给进程的
一个进程就只知道虚拟地址，而对操作系统的物理地址全然不知，这样就不会发生冲突了。

每个进程都会有自己的虚拟空间，而物理内存只有一个，所以启动大量的进程的时候，物理内存紧张，于是操作系统会通过内存交换技术，把不常用的内存暂时放到硬盘，在需要的时候再装入物理内存。

最后，说下虚拟内存有什么作用？

- 第一，虚拟内存可以使得进程对运行内存超过物理内存大小，因为程序运行符合局部性原理，CPU 访问内存会有很明显的重复访问的倾向性，对于那些没有被经常使用到的内存，我们可以把它换出到物理内存之外，比如硬盘上的 swap 区域。
- 第二，由于每个进程都有自己的页表，所以每个进程的虚拟内存空间就是相互独立的。进程也没有办法访问其他进程的页表，所以这些页表是私有的，这就解决了多进程之间地址冲突的问题。
- 第三，页表里的页表项中除了物理地址之外，还有一些标记属性的比特，比如控制一个页的读写权限，标记该页是否存在等。在内存访问方面，操作系统提供了更好的安全性。

<a name="CuEjs"></a>

## 聊一聊进程和线程

线程与进程的比较如下：

- 进程是资源（包括内存、打开的文件等）分配的单位，线程是 CPU 调度的单位；
- 进程拥有一个完整的资源平台，而线程只独享必不可少的资源，如寄存器和栈；
- 线程同样具有就绪、阻塞、执行三种基本状态，同样具有状态之间的转换关系；
- 线程能减少并发执行的时间和空间开销；

对于，线程相比进程能减少开销，体现在：

- 线程的创建时间比进程快，因为进程在创建的过程中，还需要资源管理信息，比如内存管理信息、文件管理信息，而线程在创建的过程中，不会涉及这些资源管理信息，而是共享它们；
- 线程的终止时间比进程快，因为线程释放的资源相比进程少很多；
- 同一个进程内的线程切换比进程切换快，因为线程具有相同的地址空间（虚拟内存共享），这意味着同一个进程的线程都具有同一个页表，那么在切换的时候不需要切换页表。而对于进程之间的切换，切换的时候要把页表给切换掉，而页表的切换过程开销是比较大的；
- 由于同一进程的各线程间共享内存和文件资源，那么在线程之间数据传递的时候，就不需要经过内核了，这就使得线程之间的数据交互效率更高了；

所以，不管是时间效率，还是空间效率线程比进程都要高。

<a name="fljSf"></a>

## 说一说常见的调度算法

- FCFS：先来先服务
- SJF：最短作业优先
- HRRN：高响应比优先
- RR：时间片轮转
- HPF：最高优先级
- **MFQ：多级反馈队列**

<a name="ul8Wy"></a>

## 进程间的通信有哪些方式呢？

1. 管道pipe
2. 消息队列message queue
3. 共享内存share memory
4. 信号量 semaphore
5. 信号
6. Socket

<a name="GHU6p"></a>

## 怎么避免死锁？

**两个线程都在等待对方释放锁**，在没有外力的作用下，这些线程会一直相互等待，就没办法继续运行，这种情况就是发生了**死锁**。
死锁只有**同时满足**以下四个条件才会发生：

1. 互斥条件
2. 持有并且等待
3. 不可剥夺条件
4. 环路等待

<a name="cwVQe"></a>

## 网络系统

<a name="kUbCA"></a>

### 什么是同步，异步，阻塞，非阻塞

同步与异步主要是从消息通知机制角度来说的，关键在于调用者是否有等待这个行为出现。
同步主要靠调用者自己盯进度看被调用者的工作是否完成，异步主要靠被调用者以某种方式来通知调用者它的任务完成了。

**同步**和**异步**关注点是**消息通信机制** (synchronous communication/ asynchronous communication)，是一种编程模型。
阻塞和非阻塞关注的是**线程在等待调用结果（消息、结果）时的状态。**

- 阻塞调用是指调用结果返回之前，当前线程做不了其他事情（**_被挂起或者自旋_**），调用线程只有在得到结果之后才会返回。
- 非阻塞调用指在不能立刻得到结果之前，该调用不会阻塞当前线程（例如返回一个结果代理对象或者错误码）。
- 异步非阻塞
  效率是最高的，体现在调用者没等，被调用对象有机制提醒调用者活干完了；
- 同步阻塞
  编程比较简单，体现在调用者等待，被调用对象没有提醒调用者活干完的机制，靠调用者盯进度；
- 同步非阻塞
  因为调用者不断分心在两件事间跳来跳去，所以其实效率是不高的，体现在调用者边等边做自己的事，被调用对象没有提醒机制，也靠调用者盯进度；
- 异步阻塞（这种情况一般不存在）
  实际上调用者还是在等被调用者，因为尽管被调用对象有机制提醒调用者自己活干完了，调用者还是什么都不干，傻傻地在等待。

那我先讲下同步异步和阻塞非阻塞这两大块之间的区别？
他们针对的对象不同，好比A调用B，同步异步针对的是被调用者也就是B，阻塞非阻塞针对的是调用者也就是A。
然后我们再来讲一下什么是同步和异步？
A调用B，同步异步针对得是调用方B
如果是同步的话，B处理完后有结果了才通知A.
如果是异步的话，B在接到请求后先告诉A我已经接到请求了，然后有结果后再通过callback、通知或者状态等方式再通知A。
同步和异步最大的区别就是被调用方B的执行方式和返回时机。
什么是阻塞和非阻塞？
A调用B，我们针对得是调用方A
如果是阻塞的话，A只能等待B返回结果后，才能去干别的事情
如果是非阻塞得话就是A不用等着B返回结果，可以先去做别的事情。

指的时用户空间和内核空间数据交互的方式：
同步：用户空间要的数据，必须等到内核空间给她做完才做其他事情
而异步：用户空间要的数据，不需要等待内核空间给它，才做其他事情。内核空间会异步通知用户进程并把数据直接给到用户空间。

阻塞非阻塞，
指的是用户就和内核空间IO操作的方式
阻塞：用户空间通过系统调用(systemcall)和内核空间发送IO操作时，该调用时阻塞的
非阻塞：用户空间通过系统调用（systemcall）和内核空间发送IO操作时，该调用时不阻塞的，直接返回的，只是返回时，可能没有数据而已。

> 所谓同步，就是在发送出一个功能调用的时候，在没有得到结果之前，该调用就不返回。

> 当一个一步过程调用发出后，调用者不会立刻得到结果，实际出路这个调用的不见实在调用发出后，通过状态，通知来通知调用者，或通过回调函数来处理这个调用。

看一个例子：1940 年，我是一名党的高级特工，受组织派遣，深入敌后，展开卧底行动。
**「同步」**：组织在得到我的结果前，不做事情，等待我的结果，然后做出行动；
**「异步」**：组织可以去干一些不依赖我结果的事情，截个道啊，抢个仓啊：

**同步消息通知机制：**

> “
> 好比简单的read/write操作，我们需要等待这两个操作完成才能返回；
> ”

> “
> 同步，是由处理消息者自己去等待消息是否被触发。
> ”

**异步消息通知机制：**

> “
> 类似于select/epoll之类的多路复用IO操作，当所关注的消息被触发时，由消息触发机制通知触发对消息的出路。
> ”

> "
> 异步，由触发机制来通知处理消息着。
> "

阻塞/非阻塞，它们是程序在等待消息（无所谓同步或异步）时的状态。

**阻塞：**
阻塞调用是指调用结果返回之前，当前线程会被挂起。函数只有在得到结果之后才会返回。有人也许会把阻塞调用和同步调用等同起来，实际上他是不同的。对于同步调用来说，很多时候当前线程还是激活的，只是从逻辑上当前函数没有返回而已。

**非阻塞：**
非阻塞和阻塞的概念相对应，指在不能立刻得到结果之前，该函数不会阻塞当前线程，而会立刻返回。

例子：
继续上面的那个例子，不论是叫个人天天蹲着等消息，还是使用 call 等待通知，如果在这个等待的过程中，等待者除了等待消息之外不能做其它的事情，那么该机制就是阻塞的。
表现在程序中，也就是该程序一直阻塞在该函数调用处不能继续往下执行， 相反，在等待的时候我们可以磨磨枪，埋埋雷，，这样的状态就是非阻塞的，因为他(等待者)没有阻塞在这个消息通知上，而是一边做自己的事情一边等待。

**「同步阻塞形式：」**
效率是最低的，拿上面的例子来说，就是你专心等待，什么别的事都不做。实际程序中就是未对 fd 设置 O_NONBLOCK 标志位的 read/write 操作。
**「异步阻塞形式：」**
异步操作是可以被阻塞住的，只不过它不是在处理消息时阻塞，而是在等待消息被触发时被阻塞，比如 select 函数，假如传入的最后一个 timeout 参数为 NULL，那么如果所关注的事件没有一个被触发，程序就会一直阻塞在这个 select 调用处。
**「同步非阻塞形式：」**
实际上是效率低下的，想象一下你一边做着事情一边看消息到了没有，如果把磨枪和观察消息是程序的两个操作的话，这个程序需要在这两种不同的行为之间来回的切换，效率可想而知是低下的;很多人会写阻塞的 read/write 操作，但是别忘了可以对 fd 设置 O_NONBLOCK 标志位，这样就可以将同步操作变成非阻塞的了。

<a name="zJeKo"></a>

### 什么是零拷贝

**DMA：在进行 I/O 设备和内存的数据传输的时候，数据搬运的工作全部交给 DMA 控制器，而 CPU 不再参与任何与数据搬运相关的事情，这样 CPU 就可以去处理别的事务**。

1. **基于mmap+write实现零拷贝**

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709449624687-49844506-4dee-49ab-97f9-74a9f40e6206.png#averageHue=%23f2eee2&clientId=ud1a37d8c-afb6-4&from=paste&height=604&id=eofvn&originHeight=604&originWidth=1073&originalType=binary&ratio=1&rotation=0&showTitle=false&size=190728&status=done&style=none&taskId=u9617a5d3-1eb7-4b9b-83f5-0846fb2fdde&title=&width=1073)

2. **sendfile 实现零拷贝**

在 Linux 内核版本 2.1 中，提供了一个专门发送文件的系统调用函数 sendfile()
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709449745613-a52ecf75-05fa-4b2b-a228-888a78f6f815.png#averageHue=%23f2eee4&clientId=ud1a37d8c-afb6-4&from=paste&height=631&id=w8xJs&originHeight=631&originWidth=1073&originalType=binary&ratio=1&rotation=0&showTitle=false&size=195277&status=done&style=none&taskId=uc9e2fef4-a772-4a0f-a989-33ff79c3e22&title=&width=1073)

但是这还不是真正的零拷贝技术，如果网卡支持 SG-DMA（_The Scatter-Gather Direct Memory Access_）技术（和普通的 DMA 有所不同），我们可以进一步减少通过 CPU 把内核缓冲区里的数据拷贝到 socket 缓冲区的过程。                                                     
于是，从 Linux 内核 2.4 版本开始起，对于支持网卡支持 SG-DMA 技术的情况下， sendfile() 系统调用的过程发生了点变化，具体过程如下：

- 第一步，通过 DMA 将磁盘上的数据拷贝到内核缓冲区里；
- 第二步，缓冲区描述符和数据长度传到 socket 缓冲区，这样网卡的 SG-DMA 控制器就可以直接将内核缓存中的数据拷贝到网卡的缓冲区里，此过程不需要将数据从操作系统内核缓冲区拷贝到 socket 缓冲区中，这样就减少了一次数据拷贝；

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709449888470-8f09aa94-22a8-4c67-9bee-3ea562bd027e.png#averageHue=%23efede0&clientId=ud1a37d8c-afb6-4&from=paste&height=604&id=Mmq9d&originHeight=604&originWidth=1046&originalType=binary&ratio=1&rotation=0&showTitle=false&size=190082&status=done&style=none&taskId=u9d208523-8789-48c8-a4f2-334ef542c24&title=&width=1046)

<a name="UgY5b"></a>

### I/O多路复用： select/poll/epoll

1. **最基础的Socket模型**

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709450484078-110146f8-bff9-40b3-9afd-5e6fd3497c27.png#averageHue=%23f9f7ee&clientId=ud1a37d8c-afb6-4&from=paste&height=964&id=NfG0a&originHeight=964&originWidth=583&originalType=binary&ratio=1&rotation=0&showTitle=false&size=143085&status=done&style=none&taskId=u5a703d1b-1477-4712-b909-ea4bbeb2060&title=&width=583)

2. **多进程模型**

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709450812722-9cbb5d7e-3c5a-4303-ae5f-cfa184cf2c7b.png#averageHue=%23edecd5&clientId=ud1a37d8c-afb6-4&from=paste&height=400&id=xg95c&originHeight=400&originWidth=982&originalType=binary&ratio=1&rotation=0&showTitle=false&size=140734&status=done&style=none&taskId=u9184c436-e35f-4bdb-ad4b-1b3c87de509&title=&width=982)

3. **多线程模型**

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709450961703-b37a6261-8f9d-4f5c-b54c-a4a419e876a5.png#averageHue=%23f6f4ea&clientId=ud1a37d8c-afb6-4&from=paste&height=340&id=DXIWG&originHeight=340&originWidth=1035&originalType=binary&ratio=1&rotation=0&showTitle=false&size=116836&status=done&style=none&taskId=uae19d227-570b-47fb-a434-b644098a1ed&title=&width=1035)

4. **I/O多路复用**

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709451104538-b8bff555-0d12-4f85-a99d-d41637489ce3.png#averageHue=%23fdfbfa&clientId=ud1a37d8c-afb6-4&from=paste&height=635&id=igfD9&originHeight=635&originWidth=1070&originalType=binary&ratio=1&rotation=0&showTitle=false&size=73335&status=done&style=none&taskId=uf4826df7-5763-49c3-b2cc-2817893b9ee&title=&width=1070)

5. **select/poll**

select 实现多路复用的方式是，将已连接的 Socket 都放到一个**文件描述符集合**，然后调用 select 函数将文件描述符集合**拷贝**到内核里，让内核来检查是否有网络事件产生，检查的方式很粗暴，就是通过**遍历**文件描述符集合的方式，当检查到有事件产生后，将此 Socket 标记为可读或可写， 接着再把整个文件描述符集合**拷贝**回用户态里，然后用户态还需要再通过**遍历**的方法找到可读或可写的 Socket，然后再对其处理。
所以，对于 select 这种方式，需要进行 **2 次「遍历」文件描述符集合**，一次是在内核态里，一个次是在用户态里 ，而且还会发生 **2 次「拷贝」文件描述符集合**，先从用户空间传入内核空间，由内核修改后，再传出到用户空间中。
select 使用固定长度的 BitsMap，表示文件描述符集合，而且所支持的文件描述符的个数是有限制的，在 Linux 系统中，由内核中的 FD_SETSIZE 限制， 默认最大值为 1024，只能监听 0~1023 的文件描述符。
poll 不再用 BitsMap 来存储所关注的文件描述符，取而代之用动态数组，以链表形式来组织，突破了 select 的文件描述符个数限制，当然还会受到系统文件描述符限制。
但是 poll 和 select 并没有太大的本质区别，**都是使用「线性结构」存储进程关注的 Socket 集合，因此都需要遍历文件描述符集合来找到可读或可写的 Socket，时间复杂度为 O(n)，而且也需要在用户态与内核态之间拷贝文件描述符集合**，这种方式随着并发数上来，性能的损耗会呈指数级增长。

6. **epoll**

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709451512917-dee2f88e-6c4b-4e35-af4f-cdfd06ef2e44.png#averageHue=%23ebedd1&clientId=ud1a37d8c-afb6-4&from=paste&height=486&id=vKuDP&originHeight=486&originWidth=1038&originalType=binary&ratio=1&rotation=0&showTitle=false&size=122717&status=done&style=none&taskId=u999437d3-a961-4e6c-8010-52a1b35c5f1&title=&width=1038)

epoll 是解决 C10K 问题的利器，通过两个方面解决了 select/poll 的问题。

- epoll 在内核里使用「红黑树」来关注进程所有待检测的 Socket，红黑树是个高效的数据结构，增删改一般时间复杂度是 O(logn)，通过对这棵黑红树的管理，不需要像 select/poll 在每次操作时都传入整个 Socket 集合，减少了内核和用户空间大量的数据拷贝和内存分配。
- epoll 使用事件驱动的机制，内核里维护了一个「链表」来记录就绪事件，只将有事件发生的 Socket 集合传递给应用程序，不需要像 select/poll 那样轮询扫描整个集合（包含有和无事件的 Socket ），大大提高了检测的效率。

而且，epoll 支持边缘触发和水平触发的方式，而 select/poll 只支持水平触发，一般而言，边缘触发的方式会比水平触发的效率高。

<a name="BNlOC"></a>

## Reactor和Proactor

- **Reactor 是非阻塞同步网络模式，感知的是就绪可读写事件**。在每次感知到有事件发生（比如可读就绪事件）后，就需要应用进程主动调用 read 方法来完成数据的读取，也就是要应用进程主动将 socket 接收缓存中的数据读到应用进程内存中，这个过程是同步的，读取完数据后应用进程才能处理数据。
- **Proactor 是异步网络模式， 感知的是已完成的读写事件**。在发起异步读写请求时，需要传入数据缓冲区的地址（用来存放结果数据）等信息，这样系统内核才可以自动帮我们把数据的读写工作完成，这里的读写工作全程由操作系统来做，并不需要像 Reactor 那样还需要应用进程主动发起 read/write 来读写数据，操作系统完成读写工作后，就会通知应用进程直接处理数据。

常见的 Reactor 实现方案有三种。
第一种方案单 Reactor 单进程 / 线程，不用考虑进程间通信以及数据同步的问题，因此实现起来比较简单，这种方案的缺陷在于无法充分利用多核 CPU，而且处理业务逻辑的时间不能太长，否则会延迟响应，所以不适用于计算机密集型的场景，适用于业务处理快速的场景，比如 Redis（6.0之前 ） 采用的是单 Reactor 单进程的方案。
第二种方案单 Reactor 多线程，通过多线程的方式解决了方案一的缺陷，但它离高并发还差一点距离，差在只有一个 Reactor 对象来承担所有事件的监听和响应，而且只在主线程中运行，在面对瞬间高并发的场景时，容易成为性能的瓶颈的地方。
第三种方案多 Reactor 多进程 / 线程，通过多个 Reactor 来解决了方案二的缺陷，主 Reactor 只负责监听事件，响应事件的工作交给了从 Reactor，Netty 和 Memcache 都采用了「多 Reactor 多线程」的方案，Nginx 则采用了类似于 「多 Reactor 多进程」的方案。
Reactor 可以理解为「来了事件操作系统通知应用进程，让应用进程来处理」，而 Proactor 可以理解为「来了事件操作系统来处理，处理完再通知应用进程」。

因此，真正的大杀器还是 Proactor，它是采用异步 I/O 实现的异步网络模型，感知的是已完成的读写事件，而不需要像 Reactor 感知到事件后，还需要调用 read 来从内核中获取数据。
不过，无论是 Reactor，还是 Proactor，都是一种基于「事件分发」的网络编程模式，区别在于 Reactor 模式是基于「待完成」的 I/O 事件，而 Proactor 模式则是基于「已完成」的 I/O 事件。
<a name="ux2Jk"></a>

## 什么是一致性哈希

<a name="bBwiJ"></a>

# MQ系列

<a name="ea7ju"></a>

## KafKa

Kafka 是一个分布式的、可扩展的、容错的、支持分区的（Partition）、多副本的（replica）、基于Zookeeper框架的发布-订阅消息系统，Kafka适合离线和在线消息消费。

<a name="tHAZd"></a>

### KafKa的设计

kafka是将消息以 **topic** 为单位进行归纳，发布消息的程序称为 **Producer**，消费消息的程序成为 **Consumer**

kafka是以集群的方式运行的，它可以由一个或多个服务组成，每个服务叫做一个 **Broker **, Producer
通过网络将消息发送到Kafka集群，集群向消费者提供消息，broker在中间起到一个代理保存消息的中间站。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1709825103576-e66103c7-a4db-43ee-9a1d-1723f19a7bf9.png#averageHue=%23faf8f1&clientId=u8d88e84c-6e84-4&from=paste&height=851&id=G4WCQ&originHeight=851&originWidth=1514&originalType=binary&ratio=1&rotation=0&showTitle=false&size=952255&status=done&style=none&taskId=u3b10a333-6b7c-4cc6-a087-804065b8d74&title=&width=1514)

_1）Producer_：消息生产者，发布消息到Kafka集群的终端或服务
_2）Broker_：一个 Kafka 节点就是一个 Broker，多个Broker可组成一个Kafka 集群。
如果某个 Topic 下有 n 个Partition 且集群有 n 个Broker，那么每个 Broker会存储该 Topic 下的一个 Partition
如果某个 Topic 下有 n 个Partition 且集群中有 m+n 个Broker，那么只有 n 个Broker会存储该Topic下的一个 Partition
如果某个 Topic 下有 n 个Partition 且集群中的Broker数量小于 n，那么一个 Broker 会存储该 Topic 下的一个或多个 Partition，这种情况尽量避免，会导致集群数据不均衡
_3）Topic_：消息主题，每条发布到Kafka集群的消息都会归集于此，Kafka是面向Topic 的
_4）Partition_：Partition 是Topic在物理上的分区，一个Topic可以分为多个Partition，每个Partition是一个有序的不可变的记录序列。单一主题中的分区有序，但无法保证主题中所有分区的消息有序。
_5）Consumer_：从Kafka集群中消费消息的终端或服务
_6）Consumer Group_：每个Consumer都属于一个Consumer Group，每条消息只能被Consumer Group中的一个Consumer消费，但可以被多个Consumer Group消费。
_7）Replica_：Partition 的副本，用来保障Partition的高可用性。
_8）Controller：_ Kafka 集群中的其中一个服务器，用来进行Leader election以及各种 Failover 操作。
_9）Zookeeper_：Kafka 通过Zookeeper来存储集群中的 meta 消息

<a name="zqrMV"></a>

### KafKa性能高原因

TODO：探究

1. 利用了 PageCache 缓存
2. 磁盘顺序写
3. 零拷贝技术
4. pull拉模式

<a name="qhQix"></a>

### KafKa文件高效存储设计原理

1. Kafka把 Topic 中的一个Partition 大文件分成很多个小文件段，通过多个小文件段，就很容易定期清除或删除已完成消费完成的文件，减少磁盘占用。
2. 通过索引信息可以快速定位Message和确定response的最大大小
3. 通过将索引元数据全部映射到memory，可以避免Segment文件的磁盘I/O操作
4. 通过索引文件稀疏存储，可以大幅度降低索引文件元数据占用空间大小。

<a name="cgPSE"></a>

### KafKa的优缺点

**优点**

- 高性能、高吞吐量、低延迟：Kafka 生产和消费消息的速度都达到每秒10万级
- 高可用：所有消息持久化存储到磁盘，并支持数据备份防止数据丢失
- 高并发：支持数千个客户端同时读写
- 容错性：允许集群中节点失败（若副本数量为n，则允许 n-1 个节点失败）
- 高扩展性：Kafka 集群支持热伸缩，无须停机

**缺点**

- 没有完整的监控工具集
- 不支持通配符主题选择

<a name="kgbAe"></a>

### KafKa的应用场景

1. **日志聚合**：可收集各种服务的日志写入kafka的消息队列进行存储
2. **消息系统**：广泛用于消息中间件
3. **系统解耦**：在重要操作完成后，发送消息，由别的服务系统来完成其他操作
4. **流量削峰**：一般用于秒杀或抢购活动中，来缓冲网站短时间内高流量带来的压力
5. **异步处理**：通过异步处理机制，可以把一个消息放入队列中，但不立即处理它，在需要的时候再进行处理

<a name="qLKfJ"></a>

### KafKa为什么要把消息分区

1. 方便在集群中扩展，每个 Partition 可用通过调整以适应它所在的机器，而一个Topic又可以有多个Partition组成，因此整个集群就可以适应任意大小的数据了
2. 可以提高并发，因为可以以Partition为单位进行读写

<a name="zJwCk"></a>

### KafKa消息的消费模式

> Kafka采用大部分消息系统遵循的传统模式：Producer将消息推送到Broker，Consumer从Broker获取消息。

如果采用 **Push** 模式，则Consumer难以处理不同速率的上游推送消息。
采用 Pull 模式的好处是Consumer可以自主决定是否批量的从Broker拉取数据。Pull模式有个缺点是，如果Broker没有可供消费的消息，将导致Consumer不断在循环中轮询，直到新消息到达。为了避免这点，Kafka有个参数可以让Consumer阻塞直到新消息到达。

<a name="GUGhY"></a>

### KafKa如何实现负载均衡和故障转移

负载均衡是指让系统的负载根据一定的规则均衡地分配在所有参与工作的服务器上，从而最大限度保证系统整体运行效率与稳定性
**负载均衡**
Kakfa 的负载均衡就是每个 **Broker** 都有均等的机会为 Kafka 的客户端（生产者与消费者）提供服务，可以负载分散到所有集群中的机器上。Kafka 通过智能化的分区领导者选举来实现负载均衡，提供智能化的 Leader 选举算法，可在集群的所有机器上均匀分散各个Partition的Leader，从而整体上实现负载均衡。
**故障转移**
Kafka 的故障转移是通过使用**会话机制**实现的，每台 Kafka 服务器启动后会以会话的形式把自己注册到 Zookeeper 服务器上。一旦服务器运转出现问题，就会导致与Zookeeper 的会话不能维持从而超时断连，此时Kafka集群会选举出另一台服务器来完全替代这台服务器继续提供服务。

<a name="coakq"></a>

### KafKa中Zookeeoer的作用

Kafka 是一个使用 Zookeeper 构建的分布式系统。Kafka 的各 Broker 在启动时都要在Zookeeper上注册，由Zookeeper统一协调管理。如果任何节点失败，可通过Zookeeper从先前提交的偏移量中恢复，因为它会做周期性提交偏移量工作。同一个Topic的消息会被分成多个分区并将其分布在多个Broker上，这些分区信息及与Broker的对应关系也是Zookeeper在维护。

<a name="QBIIn"></a>

## asynq

Asynq 工作原理的高级概述：

- 客户端将任务放入队列
- 服务器从队列中拉取任务并为每个任务启动一个工作协程
- 任务由多个worker同时处理

任务队列用作跨多台机器分配工作的机制。一个系统可以由多个工作服务器和代理组成，使其具有高可用性和水平扩展特性。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710467440132-8e10534f-71c6-4c75-a50b-34df7612b407.png#averageHue=%23fdfcfb&clientId=ubd638408-3c9e-4&from=paste&height=510&id=zS4fB&originHeight=638&originWidth=921&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=105025&status=done&style=none&taskId=uf6916178-e7fc-47a7-b34d-a58514ab3d9&title=&width=736.8)
特性：
Asynq有很多易用的特性，下面简单列举几个：

- **任务调度**
- **保证任务至少执行一次**
- **失败任务重试**
- **自动恢复**
- **优先级队列**
- **使用唯一选项对任务进行重复数据删除**
- **周期性任务**
- **可视化的管理界面**
- **支持Redis集群和哨兵模式**
- 与 Prometheus 集成以收集和可视化队列指标
- 用于检查和远程控制队列和任务的 Web UI
- 用于检查和远程控制队列和任务的 CLI

<a name="bWnwc"></a>

## RocketMq

[https://zhuanlan.zhihu.com/p/558139014](https://zhuanlan.zhihu.com/p/558139014)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710898420656-30e62e17-b5f7-4e9b-b709-145978483c9c.png#averageHue=%23fbfcf8&clientId=u6ebe996a-f82a-4&from=paste&id=Gszlg&originHeight=432&originWidth=666&originalType=url&ratio=1.25&rotation=0&showTitle=false&size=243850&status=done&style=none&taskId=ub0621e4c-55c9-4ecb-8b50-dbd85b02106&title=)
架构图里面包含了四个主要部分：

- NameServer集群
- Producer集群
- Cosumer集群
- Broker集群

<a name="oEmol"></a>

### 为什么使用NameServer而不是ZK

NameServer 是专为 RocketMQ 设计的轻量级名称服务，为 producer 和 consumer 提供路由信息。具有简单、可集群横吐扩展、无状态，节点之间互不通信等特点。而 RocketMQ 的架构设计决定了只需要一个轻量级的元数据服务器就足够了，只需要保持最终一致，而不需要 Zookeeper 这样的强一致性解决方案，不需要再依赖另一个中间件，从而减少整体维护成本。

<a name="t2kQF"></a>

### RocketMq如何防止消息丢失？

RocketMQ丢消息的场景

- 生产者向RocketMQ发送消息时
- RocketMQ主节点向从节点同步消息时
- 消费者向RocketMQ拉取消息消费时

**1.生产者端使用事务消息机制防止消息丢失**

**2.RocketMQ端使用同步刷盘和Dledger主从架构防止消息丢失**

**3.消费者端使用同步消费机制**

- 消费者从 broker 拉取消息，然后执行相应的业务逻辑。一旦执行成功，将会返回ConsumeConcurrentlyStatus.CONSUME_SUCCESS 状态给 Broker。
- 如果 Broker 未收到消费确认响应或收到其他状态，消费者下次还会再次拉取到该条消息，进行重试。

<a name="FEq3v"></a>

### RocketMq如何保证消息有序？

- 全局有序：整个MQ系统的所有消息严格按照队列先入先出顺序进行消费
- 局部有序：只保证一部分关键消息的消费顺序

1. 对于局部有序，只需要将有序的一组消息都存入同一个MessageQueue里，这样MessageQueue的FIFO设计就可以保证这一组消息的有序。即可以在发送者发送消息时指定一个MessageSelector对象，让这个对象来决定消息发入哪一MessageQueue，这样就可以保证一组有序的消息能够发到同一个MessageQueue里。
2. 消费端是使用MessageListenerOrderly则已经默认实现了顺序消费，如果是使用了MessageListenerConcurrently则只需把线程池改成单线程模式。

<a name="ztIpl"></a>

### RocketMq如何实现延迟消息

临时存储+定时任务。
Broker收到延时消息了，会先发送到主题（SCHEDULE_TOPIC_XXXX）的相应时间段的Message Queue中，然后通过一个定时任务轮询这些队列，到期后，把消息投递到目标Topic的队列中，然后消费者就可以正常消费这些消息。

<a name="yHJKW"></a>

### 消费消息是push还是pull

RocketMQ没有真正意义的push，都是pull，虽然有push类，但实际底层实现采用的是长轮询机制，即拉取方式。

<a name="PBBG3"></a>

### RocketMq如何对消息去重

只要通过网络交换数据，就无法避免因为网络不可靠而造成的消息重复这个问题。比如说RocketMq中，当consumer消费完消息后，因为网络问题未及时发送ack到broker,broker就不会删掉当前已经消费过的消息，那么，该消息将会被重复投递给消费者去消费。
虽然 RocketMq 保证了同一个消费组只能消费一次，但会被不同的消费组重复消费，因此这种重复消费的情况不可避免。
RocketMq本身并不保证消息不重复，这样肯定会因为每次的判断，导致性能打折扣，所以它将去重操作直接放在了消费端：

- 消费端处理消息的业务逻辑保持幂等性。那么不管来多少条重复消息，可以实现处理的结果都一样
- 还可以建立一张日志表，使用消息主键作为表的主键，在处理消息前，先insert表，再做消息处理。这样可以避免消息重复消费

rocketmq有几种模式
[https://juejin.cn/post/6997217228743507981](https://juejin.cn/post/6997217228743507981)

1. simple模式
2. work模式（轮询分发，公平分发）
3. publish/subscribe模式（发布订阅模式）
4. Routing路由模式
5. Topic主题模式
6. RPC模式

<a name="z7DZL"></a>

# 常见限流算法

那么我们先来看什么是限流？
通过对并发访问/请求进行限速，或者对一个时间窗口内的请求进行限速来保护系统，一旦达到限制速率则可以拒绝服务、排队或等待、降级等处理，避免瞬间流量过大冲垮系统，应用场景一般在秒杀，抢购，爬虫等使用非常广泛。

那为什么我们需要限流呢，流量不应该越大越好吗？
因为，

- **后台服务能力的局限性，需要限流，否则服务会崩掉**
- **可以根据测试性能去评估限流的设置，例如测试最大连接数，qps数量（每秒钟能处理的最大请求数）**
- **防止爬虫、恶意攻击**

<a name="Sotin"></a>

## 固定窗口（窗口计数法）

最常用的是使用计数器来控制，**设置固定的时间内，处理固定的请求数**
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710155018631-61da48ca-9f4d-4982-91b8-9e13ce465196.png#averageHue=%23f9f4f4&clientId=u7be26187-811a-4&from=paste&height=606&id=UScEL&originHeight=606&originWidth=1067&originalType=binary&ratio=1&rotation=0&showTitle=false&size=249402&status=done&style=none&taskId=u851d48dc-a7fe-42f0-aad1-91f78a78c1d&title=&width=1067)

上图所示，固定时间窗口来做限制，**1 s内最多**只能处理3**个**请求，红色请求则会被直接丢弃

- 固定每1秒限制同时请求数为3
- 上述红色部分的请求会被扔掉，扔掉之后 整个服务负荷可能会降低
- 但是这个会丢掉请求，对于体验不好

```go
package limiter

import (
   "sync"
   "time"
)

// FixedWindowLimiter 固定窗口限流器
type FixedWindowLimiter struct {
   limit    int           // 窗口请求上限
   window   time.Duration // 窗口时间大小
   counter  int           // 计数器
   lastTime time.Time     // 上一次请求的时间
   mutex    sync.Mutex    // 避免并发问题
}

func NewFixedWindowLimiter(limit int, window time.Duration) *FixedWindowLimiter {
   return &FixedWindowLimiter{
      limit:    limit,
      window:   window,
      lastTime: time.Now(),
   }
}

func (l *FixedWindowLimiter) TryAcquire() bool {
   l.mutex.Lock()
   defer l.mutex.Unlock()
   // 获取当前时间
   now := time.Now()
   // 如果当前窗口失效，计数器清0，开启新的窗口
   if now.Sub(l.lastTime) > l.window {
      l.counter = 0
      l.lastTime = now
   }
   // 若到达窗口请求上限，请求失败
   if l.counter >= l.limit {
      return false
   }
   // 若没到窗口请求上限，计数器+1，请求成功
   l.counter++
   return true
}
```
该算法的问题：主要是会存在临界问题，如果流量都集中在两个窗口的交界处，那么突发流量会是设置上限的两倍，还是没有避免掉可能的瞬时流量的问题。

<a name="Cfl0F"></a>

## 滑动窗口

能够去平滑一下处理的任务数量。滑动窗口计数器是通过将窗口再细分，并且按照时间滑动，这种算法避免了固定窗口算法带来的**双倍突发请求**，但时间区间精度越高，算法所需的空间容量越大。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710155091848-0a64c325-8f90-4b53-8005-42909acd80a8.png#averageHue=%23faf8f8&clientId=u7be26187-811a-4&from=paste&height=704&id=cBrJJ&originHeight=704&originWidth=1165&originalType=binary&ratio=1&rotation=0&showTitle=false&size=284685&status=done&style=none&taskId=u46d0744a-4f85-4656-aa8a-f1f8b840e65&title=&width=1165)

- 将时间划分为多个区间
- 在每个区间内每有一次请求就讲计数器加1维持一个时间窗口，占据多个区间
- 每经过一个区间的时间，则抛弃最老的一个区间，并纳入最新的一个区间
- 若当前的窗口内区间的请求总数和超过了限制数量，**则本窗口内的请求都被丢弃**

该算法虽然解决了固定窗口的边界问题，但是还是存在限流不够平滑的问题。例如：限流是每秒100个，在第一毫秒发送了100个请求，达到限流，剩余窗口时间的请求都将会被拒绝，体验不好，那我们继续看下面的算法。
<a name="H8Ot5"></a>

## 漏桶算法

漏桶算法(Leaky Bucket)是网络世界中流量整形（Traffic Shaping）或速率限制（Rate Limiting）时经常使用的一种算法，它的主要目的是控制数据注入到网络的速率，平滑网络上的突发流量。漏桶算法提供了一种机制，通过它，突发流量可以被整形以便为网络提供一个稳定的流量。

该算法的优势：

1. **平滑流量。**由于漏桶算法以固定的速率处理请求，可以有效地平滑和整形流量，避免流量的突发和波动（类似于消息队列的削峰填谷的作用）。
   **2.防止过载。**当流入的请求超过桶的容量时，可以直接丢弃请求，防止系统过载。该算法的缺点：
2. 无法处理突发流量：由于漏桶的出口速度是固定的，无法处理突发流量。例如，即使在流量较小的时候，也无法以更快的速度处理请求。
3. 可能会丢失数据：如果入口流量过大，超过了桶的容量，那么就需要丢弃部分请求。在一些不能接受丢失请求的场景中，这可能是一个问题。
4. 不适合速率变化大的场景：如果速率变化大，或者需要动态调整速率，那么漏桶算法就无法满足需求。

<a name="nGZe2"></a>

## 令牌桶算法

令牌桶算法是网络流量整形（Traffic Shaping）和速率限制（Rate Limiting）中最常使用的一种算法。典型情况下，令牌桶算法用来控制发送到网络上的数据的数目，并允许突发数据的发送。
令牌桶算法的原理是系统会以一个恒定的速度往桶里放入令牌，而如果请求需要被处理，则需要先从桶里获取一个令牌，当桶里没有令牌可取时，则拒绝服务。从原理上看，令牌桶算法和漏桶算法是相反的，一个“进水”，一个是“漏水”。

算法原理：

1. 令牌桶算法可控制发送到网络上数据的数目，并允许突发数据的发送；
2. 大小固定的令牌桶可自行以恒定的速率源源不断地产生令牌：
   1）、令牌桶中的每一个令牌都代表一个字节
   2）、如果令牌桶中存在令牌，则允许发送流量
   3）、如果令牌桶中不存在令牌，则不允许发送流量
   4）、若令牌不被消耗，或被消耗速度小于产生速度，令牌就会不断地增多，直到把桶填满
   5）、传送到令牌桶的数据包需要消耗令牌，不同大小的数据包，消耗的令牌数量不同

令牌桶算法的优势：

1. **可以处理突发流量**：令牌桶算法可以处理突发流量。当桶满时，能够以最大速度处理请求。这对于需要处理突发流量的应用场景非常有用；
   **2. 限制平均速率**：在长期运行中，数据的传输率会被限制在预定义的平均速率（即生成令牌的速率）；
   **3. 灵活性**：与漏桶算法相比，令牌桶算法提供了更大的灵活性。例如，可以动态地调整生成令牌的速率；

**该算法的缺点：**
**1. 导致过载的可能性**：要控制令牌的产生速度，如果令牌产生的速度过快，可能会导致大量的突发流量，这可能会使网络或服务过载。
**2. 内存资源限制**：令牌桶需要一定的存储空间来保存令牌，可能会导致内存资源的浪费。

**总结：计数器、漏桶、令牌桶算法限流有各自的特点及应用场景，不能单一维度地判断哪个算法最好。**
计数器算法实现简单，适用于对接口频次的限制，如防恶意刷帖限制等;
漏桶限流适用于处理流量突刺现象，因为只要桶为空就可以接受请求；
令牌桶限流适用于应对突发流量，也是目前互联网架构中最常用的一种限流方式，只要能取到令牌即可处理请求。

<a name="yCrcx"></a>

# go-zero相关的问题

1. **grpc是什么？有哪些优点**

gRPC是一种高性能、开源的远程过程调用（RPC）框架，它可以使不同平台和语言之间的服务相互通信。它的优点包括：高效性、跨平台、异步流处理、支持多种语言、安全、易于使用和开源。

2. **gPRC和REST的区别是什么？**

REST是基于HTTP协议的一种风格，而gRPC是一个独立于协议的RPC框架。 REST基于资源的状态转移，使用标准的HTTP方法，而gRPC使用协议缓冲区（Protocol Buffers）进行序列化和反序列化。 gRPC支持异步流处理和双向流，而REST通常只支持请求/响应模式。

3. **Protocol Buffers是什么，为什么它被用于gRPC中？**

Protocol Buffers是一种语言中立、平台中立、可扩展的序列化格式，它可以用于数据交换和持久化。它被用于gRPC中，因为它可以实现高效的序列化和反序列化，从而提高了gRPC的性能和效率。**

4. **gPRC的流程是什么？**

gRPC流程分为四个步骤：定义服务、生成源代码、实现服务、启动服务。首先，需要定义要实现的服务及其接口，使用Protocol Buffers编写接口定义文件。其次，使用编译器生成客户端和服务器端的源代码。然后，实现生成的接口。最后，启动服务器并将其部署在适当的位置。
****5. gRPC支持哪些类型的序列化？**
gRPC支持两种类型的序列化：二进制（使用Protocol Buffers）和JSON。其中，二进制序列化在效率和性能方面比JSON序列化更优秀。但是，JSON序列化在可读性方面更好，可以方便地进行调试和测试。

6. **go-zero是什么？它的主要功能是是什么？它与其他Go框架有什么不同？**

Go-Zero 是一个基于 Go 语言的微服务开发框架。它旨在提供简单、高效和可靠的微服务开发解决方案。Go-Zero 主要功能包括 RPC、缓存、限流、熔断、监控等。相较于其他 Go 框架，如 Gin 或 Beego，Go-Zero 更加专注于微服务开发，并提供了更多的开箱即用的功能。

7. **如何使用go-zero实现异步任务？**

go-zero中提供了go-queue包来实现异步任务。具体步骤如下：
1）创建一个Redis连接池。
2）通过queue.New(queueConfig, redisConfig)创建一个队列实例。
3）通过producer := queue.NewProducer()创建一个生产者实例。
4）通过consumer := queue.NewConsumer(queueConfig, redisConfig)创建一个消费者实例。
5）通过producer.Enqueue(job)将任务放入队列。
6）通过consumer.Consume(processor)处理队列中的任务。

8. **go-zero如何实现限流？**

go-zero中提供了go-ratelimit包来实现限流。具体步骤如下：
1）通过rate.NewLimiter(rate.Every(time.Second), 100)创建一个限流器实例，限制每秒处理100个请求。
2）通过limiter.Allow()方法判断当前请求是否被允许，若被允许则处理请求，否则返回错误提示。

<a name="ceHhy"></a>

## DTM的TTC

2pc
3pc
TTC
try-confirm-cancle

<a name="pmTuG"></a>

# 微服务面经

<a name="ABaQB"></a>

## RPC和HTTP

<a name="rhpd6"></a>

### RPC原理

RPC服务基本架构包含了四个核心的组件，分别是Client,Server,Clent Stub以及Server Stub。
RPC 让远程调用就像本地调用一样，其调用过程可拆解为以下步骤。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1711160551085-db6a9fb6-f1e5-475f-abef-220d7a33fbf6.png#averageHue=%23f6f5f4&clientId=ub244fb08-c28c-4&from=paste&height=624&id=u7651fe06&originHeight=624&originWidth=1221&originalType=binary&ratio=1&rotation=0&showTitle=false&size=203201&status=done&style=none&taskId=ub9951bff-3ab9-44f0-9fd4-af0b90c57c1&title=&width=1221)

<a name="fGiqM"></a>

### 流行的RPC框架

目前流行的RPC框架有很多，下面介绍常见的三种。

1. gRPC：gRPC是Google公布的开源项目，基于HTTP2.0协议，并支持常见的众多编程语言。HTTP 2.0协议是基于二进制的HTTP协议的升级版本，gRPC底层使用了Netty框架。
2. Thrift：Thrift是Facebook的一个开源项目，主要是一个跨语言的服务开发框架。它有一个代码生成器来对它所定义的IDL文件自动生成服务代码框架。Thrift对于底层的RPC通讯都是透明的，用户只需要对其进行二次开发即可，省去了一系列重复的前置基础开发工作。
3. Dubbo：Dubbo是阿里集团开源的一个极为出名的RPC框架，在很多互联网公司和企业应用中广泛使用。协议和序列化框架都可以插拔是及其鲜明的特色。

<a name="zE5BB"></a>

# 面经分享

<a name="nRIu7"></a>

## 字节二面

1. 10进制转62进制

```go
func to62RadixString(seq int64) string {
	ch := []byte{'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
		'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
		'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
		'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
		'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'}
	ans := make([]byte, 0)

	for {
		remainder := int(seq % 62)
		ans = append(ans, ch[remainder])
		seq /= 62
		if seq == 0 {
			break
		}
	}
	sort.Slice(ans, func(i, j int) bool {
		return i > j
	})
	return string(ans)
}
```
<a name="G4SuU"></a>

# 奇怪的问题

<a name="nW2Hb"></a>

## 在程序中一般溢出的处理？数据怎么存储的？

原码

补码

反码
![image.png](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710897685088-ea34779b-9eba-40da-bde7-c4a60878ec3b.png#averageHue=%23faf8f7&clientId=u6ebe996a-f82a-4&from=paste&height=396&id=mnLM3&originHeight=495&originWidth=1226&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=50961&status=done&style=none&taskId=u7422bc64-23b2-4be1-a7ae-dae8d4356ac&title=&width=980.8)

<a name="HF608"></a>

# 系统设计类的问题？

<a name="kofC4"></a>

## **系统设计答题思路：**

**使用场景 和 限制条件？**

- 这个系统是在什么地方使用的？比如**短网址系统提供给站内各种服务生成短网址**
- **限制条件**：用户估计多少，至少要能支撑多少用户
- **估算并发qps**：峰值qps，平均qps

**数据库存储 ？**

- 按需设计数据库表，需要哪些字段，使用什么类型？数据增长规模
- 数据库选型：是否需要持久化？使用关系型还是 NoSQL？
- 如何优化？如何设计索引？是否可以使用缓存？

**算法模块设计**

- 算法解决问题的核心。程序 = 算法 + 数据结构。 系统 = 服务  + 存储
- 需要哪些接口，接口如何设计
- 使用什么算法或模型
- 不同实现方法之间的优劣势对比，如何取舍

延伸考点

- 如果回答不错，可能会问一些深入的问题（扩展、容错）
- 用户多了，qps高了如何处理？
- 数据存储多了不够存了如何处理？
- 故障如何处理？单点失败、多点失败、雪崩问题

<a name="F4iMQ"></a>

## 短链路系统

如何设计一个短网址服务(TinyURL)？
**使用场景？**
微博和Twitter都有140字数的限制，如果分享一个长网址，很容易就超出限制，发布出去。短网址服务可以把一个长网址变成短网址，方便在社交网络上传播。
**需求(Needs)**
很显然，要尽可能的**短**。长度设计为多少才合适呢？

微博的短网址服务用的是长度为7的字符串，这个字符串可以看做是62进制的数，那么最大能表示{62}^7=352161****208627=3521614606208个网址，远远大于45亿。所以**长度为7就足够了**。
一个64位整数如何转化为字符串呢？，假设我们只是用大小写字母加数字，那么可以看做是62进制数，log_{62} {(2^{64}-1)}=10.7_l**o**g_62(264−1)=10.7，即字符串最长11就足够了。
实际生产中，还可以再短一点，比如新浪微博采用的长度就是7，因为 62^7=352161****208627=3521614606208，这个量级远远超过互联网上的URL总数了，绝对够用了。
现代的web服务器（例如Apache, Nginx）大部分都区分URL里的大小写了，所以用大小写字母来区分不同的URL是没问题的。
因此，**正确答案：长度不超过7的字符串，由大小写字母加数字共62个字母组成**

**一对一还是一对多映射？**
一个长网址，对应一个短网址，还是可以对应多个短网址？这也是个重大选择问题
一般而言，一个长网址，在不同的地点，不同的用户等情况下，生成的短网址应该不一样，这样，在后端数据库中，可以更好的进行数据分析。如果一个长网址与一个短网址一一对应，那么在数据库中，仅有一行数据，无法区分不同的来源，就无法做数据分析了。
以这个7位长度的短网址作为唯一ID，这个ID下可以挂各种信息，比如生成该网址的用户名，所在网站，HTTP头部的 User Agent等信息，收集了这些信息，才有可能在后面做大数据分析，挖掘数据的价值。短网址服务商的一大盈利来源就是这些数据。
**正确答案：一对多**

**如何计算网址？**
现在我们设定了短网址是一个长度为7的字符串，如何计算得到这个短网址呢？
**最容易想到的办法是哈希，先hash得到一个64位整数，将它转化为62进制整，截取低7位即可。但是哈希算有冲突，如何处理冲突呢，又是一个麻烦。这个方法只是转移了矛盾，没有解决矛盾，抛弃。 **
**正确答案：分布式ID生成器**

**如何存储？**
如果存储短网址和长网址的对应关系？以短网址为 primary key, 长网址为value, 可以用传统的关系数据库存起来，例如MySQL, PostgreSQL，也可以用任意一个分布式KV数据库，例如Redis, LevelDB。
如果你手痒想要手工设计这个存储，那就是另一个话题了，你需要完整地造一个KV存储引擎轮子。当前流行的KV存储引擎有LevelDB和RockDB，去读它们的源码吧

**301还是302重定向？**
这也是一个有意思的问题。这个问题主要是考察你对301和302的理解，以及浏览器缓存机制的理解。
301是永久重定向，302是临时重定向。短地址一经生成就不会变化，所以用301是符合http语义的。但是如果用了301， Google，百度等搜索引擎，搜索的时候会直接展示真实地址，那我们就**无法统计到短地址被点击的次数了，也无法收集用户的Cookie, User Agent 等信息**，这些信息可以用来做很多有意思的大数据分析，也是短网址服务商的主要盈利来源。
所以，**正确答案是302重定向**。

**预防攻击？**
如果一些别有用心的黑客，短时间内向TinyURL服务器发送大量的请求，会迅速耗光ID，怎么办呢？
首先，**限制IP的单日请求总数，超过阈值则直接拒绝服务。**
光限制IP的请求数还不够，因为黑客一般手里有上百万台肉鸡的，IP地址大大的有，所以光限制IP作用不大。
可以用一台Redis作为缓存服务器，存储的不是 ID->长网址，而是 **长网址->ID**，仅存储一天以内的数据，用LRU机制进行淘汰。这样，如果黑客大量发同一个长网址过来，直接从缓存服务器里返回短网址即可，他就无法耗光我们的ID了。

<a name="bkQjI"></a>

## 设计秒杀系统

**参考链接:** [https://cloud.tencent.com/developer/article/1863530](https://cloud.tencent.com/developer/article/1863530)

1. 瞬间高并发
2. 页面静态化
3. 秒杀按钮
4. 读多写少
5. 缓存问题
6. 库存问题
7. 分布式锁
8. mq异步处理
9. 如何限流

<a name="V0YdM"></a>

### **瞬间高并发：**

一般在秒杀时间点（比如：12点）前几分钟，用户并发量才真正突增，达到秒杀时间点时，并发量会达到顶峰。
像这种瞬时高并发的场景，传统的系统很难应对，我们需要设计一套全新的系统。可以从以下几个方面入手：

1. **页面静态化**
2. **CDN加速**
3. **缓存**
4. **mq异步处理**
5. **限流**
6. **分布式锁**

<a name="LvrlS"></a>

### **页面静态化**

活动页面是用户流量的第一入口，所以是并发量最大的地方。
如果这些流量都能直接访问服务端，恐怕服务端会因为承受不住这么大的压力，而直接挂掉。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710940463688-00036929-2b3a-46d1-918f-c4f494a4315e.jpeg#averageHue=%23f5f4f2&clientId=uf7da8455-ee45-4&from=paste&id=gJMfi&originHeight=354&originWidth=1070&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u7c3ab00a-6a42-4f3e-9273-2a972ff9a2f&title=)
活动页面绝大多数内容是固定的，比如：**商品名称**、**商品描述、图片**等。为了减少不必要的服务端请求，通常情况下，会对活动页面做静态化处理。用户浏览商品等常规操作，并不会请求到服务端。只有到了秒杀时间点，并且用户主动点了秒杀按钮才允许访问服务端。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710940493979-e2f9506a-20c1-4ea2-adb4-f1341cfd1af8.jpeg#averageHue=%23f4f3f3&clientId=uf7da8455-ee45-4&from=paste&id=R83DI&originHeight=342&originWidth=1144&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uc7b2e87a-da3f-4bb5-bf21-3c799510e98&title=)
这样能过滤大部分无效请求。
但只做页面静态化还不够，因为用户分布在全国各地，有些人在北京，有些人在成都，有些人在深圳，地域相差很远，网速各不相同。
如何才能让用户最快访问到活动页面呢？
这就需要使用**CDN**，它的全称是**Content Delivery Network**，即[内容分发网络](https://cloud.tencent.com/product/cdn?from_column=20065&from=20065)。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710940528055-be2415f3-e45d-49da-bc21-ebbdf2b5b40f.jpeg#averageHue=%23f6f6f5&clientId=uf7da8455-ee45-4&from=paste&id=DWwBv&originHeight=550&originWidth=1246&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u1cbb3879-aa97-48dc-97c1-e860b526501&title=)
使用户就近获取所需内容，降低网络拥塞，提高用户访问响应速度和命中率。

<a name="sXyTU"></a>

### **秒杀按钮**

大部分用户怕错过秒杀时间点，一般会提前进入活动页面。此时看到的秒杀按钮是置灰，不可点击的。只有到了秒杀时间点那一时刻，秒杀按钮才会自动点亮，变成可点击的。
但此时很多用户已经迫不及待了，通过不停刷新页面，争取在第一时间看到秒杀按钮的点亮。
从前面得知，该活动页面是静态的。那么我们在静态页面中如何控制秒杀按钮，只在秒杀时间点时才点亮呢？
没错，**使用js文件控制。**
为了性能考虑，**一般会将css、js和图片等静态资源文件提前缓存到CDN上**，让用户能够就近访问秒杀页面。
看到这里，有些聪明的小伙伴，可能会问：CDN上的js文件是如何更新的？
秒杀开始之前，js标志为false，还有另外一个随机参数。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710940843481-7c4da998-c8f8-4865-b37c-7d1a53924a64.jpeg#averageHue=%23f5f4f3&clientId=uf7da8455-ee45-4&from=paste&id=U1NV0&originHeight=482&originWidth=1406&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uf641d095-7602-410f-9a80-8f92bea628b&title=)
**当秒杀开始的时候系统会生成一个新的js文件，此时标志为true，并且随机参数生成一个新值，**然后同步给CDN。由于有了这个随机参数，CDN不会缓存数据，每次都能从CDN中获取最新的js代码。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710940898606-e84c5e27-3d25-457a-876c-cd20bb472c43.jpeg#averageHue=%23ecdcc4&clientId=uf7da8455-ee45-4&from=paste&id=AeXu1&originHeight=470&originWidth=1376&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u6514619e-d21e-408a-bafb-e1d02aab06b&title=)
此外，前端还可以加一个定时器，控制比如：10秒之内，只允许发起一次请求。如果用户点击了一次秒杀按钮，则在10秒之内置灰，不允许再次点击，等到过了时间限制，又允许重新点击该按钮。

<a name="zJkzy"></a>

### **读多写少**

在秒杀的过程中，系统一般会先查一下库存是否足够，如果足够才允许下单，写[数据库](https://cloud.tencent.com/solution/database?from_column=20065&from=20065)。如果不够，则直接返回该商品已经抢完。
由于大量用户抢少量商品，只有极少部分用户能够抢成功，所以绝大部分用户在秒杀时，库存其实是不足的，系统会直接返回该商品已经抢完。
这是非常典型的：读多写少 的场景。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710941023642-acba858c-3320-4e44-af3b-60dda744a7fe.jpeg#averageHue=%23faf9f7&clientId=uf7da8455-ee45-4&from=paste&id=Bkrft&originHeight=842&originWidth=586&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u8eb8a61a-c337-4c0d-8a7c-da784ef2105&title=)
如果有数十万的请求过来，同时通过数据库查缓存是否足够，此时数据库可能会挂掉。因为数据库的连接资源非常有限，比如：mysql，无法同时支持这么多的连接。
**而应该改用缓存，比如：redis。**
即便用了redis，也需要部署多个节点。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710941104239-e2a5bd1c-ead5-4806-8c92-aa30ef774ced.jpeg#averageHue=%23fcfcfb&clientId=uf7da8455-ee45-4&from=paste&id=I0i8H&originHeight=888&originWidth=772&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uabf0b91c-4f3e-4766-af96-de7f44cf389&title=)

<a name="OBEvj"></a>

### **缓存问题**

通常情况下，我们需要在redis中保存商品信息，里面包含：商品id、商品名称、规格属性、库存等信息，同时数据库中也要有相关信息，毕竟缓存并不完全可靠。
用户在点击秒杀按钮，请求秒杀接口的过程中，需要传入的商品id参数，然后服务端需要校验该商品是否合法。
大致流程如下图所示：
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710941193272-b72bf548-eb55-4079-8108-1335514b2ccd.jpeg#averageHue=%23fbfafa&clientId=uf7da8455-ee45-4&from=paste&id=O7Hcq&originHeight=804&originWidth=1204&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uf000a7c1-a9ec-47e4-a3b8-2b403be5d25&title=)
根据商品id，先从缓存中查询商品，如果商品存在，则参与秒杀。如果不存在，则需要从数据库中查询商品，如果存在，则将商品信息放入缓存，然后参与秒杀。如果商品不存在，则直接提示失败。
这个过程表面上看起来是OK的，但是如果深入分析一下会发现一些问题。

**5.1缓存击穿**
比如商品A第一次秒杀时，缓存中是没有数据的，但数据库中有。虽说上面有如果从数据库中查到数据，则放入缓存的逻辑。
然而，在高并发下，同一时刻会有大量的请求，都在秒杀同一件商品，这些请求同时去查缓存中没有数据，然后又同时访问数据库。结果悲剧了，数据库可能扛不住压力，直接挂掉。
如何解决这个问题呢？
这就需要加锁，最好使用分布式锁。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710941437752-29bd44ed-806d-4935-b033-c0a7311ada19.jpeg#averageHue=%23fafaf9&clientId=uf7da8455-ee45-4&from=paste&id=aRTXa&originHeight=814&originWidth=1454&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u217054ca-14f2-4b55-a7ff-34d365ef252&title=)
当然，针对这种情况，最好在项目启动之前，先把缓存进行预热。即事先把所有的商品，同步到缓存中，这样商品基本都能直接从缓存中获取到，就不会出现缓存击穿的问题了。
是不是上面加锁这一步可以不需要了？
表面上看起来，确实可以不需要。但如果缓存中设置的过期时间不对，缓存提前过期了，或者缓存被不小心删除了，如果不加速同样可能出现缓存击穿。
其实这里加锁，相当于买了一份保险。

5.**2 缓存击穿**
如果有大量的请求传入的商品id，在缓存中和数据库中都不存在，这些请求不就每次都会穿透过缓存，而直接访问数据库了。
由于前面已经加了锁，所以即使这里的并发量很大，也不会导致数据库直接挂掉。
但很显然这些请求的处理性能并不好，有没有更好的解决方案？
这时可以想到布隆过滤器。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710941566762-31e2e997-26c8-4d7f-834e-44cc67442fa4.jpeg#averageHue=%23fafaf9&clientId=uf7da8455-ee45-4&from=paste&id=ZJ6B6&originHeight=664&originWidth=616&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uc2f07908-1209-49a0-a198-8890c372956&title=)
系统根据商品id，先从布隆过滤器中查询该id是否存在，如果存在则允许从缓存中查询数据，如果不存在，则直接返回失败。
虽说该方案可以解决缓存穿透问题，但是又会引出另外一个问题：布隆过滤器中的数据如何更缓存中的数据保持一致？
这就要求，如果缓存中数据有更新，则要及时同步到布隆过滤器中。如果数据同步失败了，还需要增加重试机制，而且跨数据源，能保证数据的实时一致性吗？
显然是不行的。
**所以布隆过滤器绝大部分使用在缓存数据更新很少的场景中。**
**如果缓存数据更新非常频繁，又该如何处理呢？**
这时，就需要把不存在的商品id也缓存起来。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710941622641-4f7ba7b5-27ff-460e-8828-31b9ff0d6677.jpeg#averageHue=%23fbfaf9&clientId=uf7da8455-ee45-4&from=paste&id=aZz6X&originHeight=660&originWidth=624&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u811bb8be-698b-4a3d-a94f-50d891212d4&title=)
下次，再有该商品id的请求过来，则也能从缓存中查到数据，只不过该数据比较特殊，表示商品不存在。需要特别注意的是，这种特殊缓存设置的超时时间应该尽量短一点。

<a name="kyMXy"></a>

### **库存问题**

对于库存问题看似简单，实则里面还是有些东西。
真正的秒杀商品的场景，不是说扣完库存，就完事了，如果用户在一段时间内，还没完成支付，扣减的库存是要加回去的。
所以，在这里引出了一个预扣库存的概念，预扣库存的主要流程如下：
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710941712315-d5c1471c-f100-4f7c-b173-9ee7b8a4de15.jpeg#averageHue=%23fbfaf9&clientId=uf7da8455-ee45-4&from=paste&id=Y1MXY&originHeight=786&originWidth=620&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u936c1aa8-2ece-4c1d-8fad-279e187aad6&title=)
扣减库存中除了上面说到的预扣库存和回退库存之外，还需要特别注意的是库存不足和库存超卖问题。

**6.1 数据库扣减库存**
使用数据库扣减库存，是最简单的实现方案了，假设扣减库存的sql如下：

```sql
update product set stock=stock-1 where id=123;
```
这种写法对于扣减库存是没有问题的，但如何控制库存不足的情况下，不让用户操作呢？
这就需要在update之前，先查一下库存是否足够了。
只需将上面的sql稍微调整一下：

```sql
update product set stock=stock-1 where id=product and stock > 0;
```
在sql最后加上：stock > 0，就能保证不会出现超卖的情况。
**但需要频繁访问数据库，我们都知道数据库连接是非常昂贵的资源。**在高并发的场景下，可能会造成系统雪崩。而且，容易出现多个请求，同时竞争行锁的情况，造成相互等待，从而出现死锁的问题。

**6.2redis扣减库存**
redis的incr方法是原子性的，可以用该方法扣减库存。
伪代码如下：

```java
boolean exist = redisClient.query(productId,userId);
if(exist) {
    return -1;
}
int stock = redisClient.queryStock(productId);
if(stock <=0) {
    return 0;
}
redisClient.incrby(productId, -1);
redisClient.add(productId,userId);
return 1;
```
代码流程如下：

1. 先判断该用户有没有秒杀过该商品，如果已经秒杀过，则直接返回-1。
2. 查询库存，如果库存小于等于0，则直接返回0，表示库存不足。
3. 如果库存充足，则扣减库存，然后将本次秒杀记录保存起来。然后返回1，表示成功。

估计很多小伙伴，一开始都会按这样的思路写代码。但如果仔细想想会发现，这段代码有问题。
有什么问题呢？
如果在高并发下，有多个请求同时查询库存，当时都大于0。由于查询库存和更新库存非原则操作，则会出现库存为负数的情况，即库存超卖。

```java
boolean exist = redisClient.query(productId,userId);
if(exist) {
  return -1;
}
if(redisClient.incrby(productId, -1)<0) {
  return 0;
}
redisClient.add(productId,userId);
return 1;
```
该代码主要流程如下：

1. 先判断该用户有没有秒杀过该商品，如果已经秒杀过，则直接返回-1。
2. 扣减库存，判断返回值是否小于0，如果小于0，则直接返回0，表示库存不足。
3. 如果扣减库存后，返回值大于或等于0，则将本次秒杀记录保存起来。然后返回1，表示成功。

该方案咋一看，好像没问题。
但如果在高并发场景中，有多个请求同时扣减库存，大多数请求的incrby操作之后，结果都会小于0。
虽说，库存出现负数，不会出现超卖的问题。但由于这里是预减库存，如果负数值负的太多的话，后面万一要回退库存时，就会导致库存不准。
那么，有没有更好的方案呢？

**6.3 基于lua脚本扣减库存**
我们都知道lua脚本，是能够保证原子性的，它跟redis一起配合使用，能够完美解决上面的问题。
lua脚本有段非常经典的代码：

```java
  StringBuilder lua = new StringBuilder();
  lua.append("if (redis.call('exists', KEYS[1]) == 1) then");
  lua.append("    local stock = tonumber(redis.call('get', KEYS[1]));");
  lua.append("    if (stock == -1) then");
  lua.append("        return 1;");
  lua.append("    end;");
  lua.append("    if (stock > 0) then");
  lua.append("        redis.call('incrby', KEYS[1], -1);");
  lua.append("        return stock;");
  lua.append("    end;");
  lua.append("    return 0;");
  lua.append("end;");
  lua.append("return -1;");
```
**该代码的主要流程如下：**

1. 先判断商品id是否存在，如果不存在则直接返回。
2. 获取该商品id的库存，判断库存如果是-1，则直接返回，表示不限制库存。
3. 如果库存大于0，则扣减库存。
4. 如果库存等于0，是直接返回，表示库存不足。

<a name="HSbLf"></a>

### **分布式锁**

之前我提到过，在秒杀的时候，需要先从缓存中查商品是否存在，如果不存在，则会从数据库中查商品。如果数据库中，则将该商品放入缓存中，然后返回。如果数据库中没有，则直接返回失败。
大家试想一下，如果在高并发下，有大量的请求都去查一个缓存中不存在的商品，这些请求都会直接打到数据库。数据库由于承受不住压力，而直接挂掉。
那么如何解决这个问题呢？
这就需要用redis分布式锁了。
**可以采用的分布式锁**

1. setnx
2. 自旋锁
3. redisson
4. redlock

<a name="FTJoL"></a>

### **mq异步**

我们都知道在真实的秒杀场景中，有三个核心流程：
![](https://cdn.nlark.com/yuque/0/2024/png/32717568/1710943283661-603f20ca-f397-4a7c-9d32-4004c150ac5e.png#averageHue=%23f8f4f4&clientId=uf7da8455-ee45-4&from=paste&id=RNgWD&originHeight=156&originWidth=860&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u994e5369-19ae-4907-992f-1bfd2753282&title=)
而这三个核心流程中，真正并发量大的是秒杀功能，下单和支付功能实际并发量很小。所以，我们在设计秒杀系统时，有必要把下单和支付功能从秒杀的主流程中拆分出来，特别是下单功能要做成mq异步处理的。而支付功能，比如支付宝支付，是业务场景本身保证的异步。
于是，秒杀后下单的流程变成如下：
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710943316877-dd646c0f-aa35-4728-a044-c56c9189d727.jpeg#averageHue=%23e5e6e0&clientId=uf7da8455-ee45-4&from=paste&id=MyJQJ&originHeight=334&originWidth=746&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u7d94d905-9203-4c19-8f02-97bcfafe607&title=)
如果使用mq，需要关注以下几个问题：

**8.1 消息丢失问题**
秒杀成功了，往mq发送下单消息的时候，有可能会失败。原因有很多，比如：网络问题、broker挂了、mq服务端磁盘问题等。这些情况，都可能会造成消息丢失。
那么，如何防止消息丢失呢？
答：加一张**消息发送表。**
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710943357417-c51458d6-5fd6-4750-8bf5-1405766a3733.jpeg#averageHue=%23e7e3d8&clientId=uf7da8455-ee45-4&from=paste&id=okXZh&originHeight=470&originWidth=818&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ud8803efc-b527-4de7-a264-c45424b942b&title=)
在生产者发送mq消息之前，先把该条消息写入消息发送表，初始状态是待处理，然后再发送mq消息。消费者消费消息时，处理完业务逻辑之后，再回调生产者的一个接口，修改消息状态为已处理。
如果生产者把消息写入消息发送表之后，再发送mq消息到mq服务端的过程中失败了，造成了消息丢失。
这时候，要如何处理呢？
答：使用job，**增加重试机制。**
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710943413890-e6ca3240-81ac-4bc3-a492-e6fbda09bcb9.jpeg#averageHue=%23f9f8f6&clientId=uf7da8455-ee45-4&from=paste&id=QbXhv&originHeight=296&originWidth=934&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u7149402a-3aaa-4b5e-861c-5c803beff2b&title=)
用job每隔一段时间去查询消息发送表中状态为待处理的数据，然后重新发送mq消息。

**8.2 重复消费问题**
本来消费者消费消息时，在ack应答的时候，如果网络超时，本身就可能会消费重复的消息。但由于消息发送者增加了重试机制，会导致消费者重复消息的概率增大。
那么，如何解决重复消息问题呢？
答：**加一张消息处理表。**
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710943532083-9448e33c-2d8a-402b-93f0-bf8555472199.jpeg#averageHue=%23fbfafa&clientId=uf7da8455-ee45-4&from=paste&id=XQqVw&originHeight=704&originWidth=814&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=uf1b1a101-6c35-49b8-9968-5a55c40508e&title=)
消费者读到消息之后，先判断一下消息处理表，是否存在该消息，如果存在，表示是重复消费，则直接返回。如果不存在，则进行下单操作，接着将该消息写入消息处理表中，再返回。
有个比较关键的点是：**下单和写消息处理表，要放在同一个事务中，保证原子操作。**

**8.3 垃圾消息问题**
这套方案表面上看起来没有问题，但如果出现了消息消费失败的情况。比如：由于某些原因，消息消费者下单一直失败，一直不能回调状态变更接口，这样job会不停的重试发消息。最后，会产生大量的垃圾消息。
那么，如何解决这个问题呢？
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710943693323-0fa70129-4ed8-446f-8473-13522bccb1eb.jpeg#averageHue=%23fbfbfa&clientId=uf7da8455-ee45-4&from=paste&id=ZBB2m&originHeight=514&originWidth=1400&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ub15ac58e-4212-4b59-9938-aec24eaeaae&title=)
每次在job重试时，需要先判断一下消息发送表中该消息的发送次数是否达到最大限制，如果达到了，则直接返回。如果没有达到，则将次数加1，然后发送消息。
这样如果出现异常，只会产生少量的垃圾消息，不会影响到正常的业务。

**8.4 延迟消费问题**
通常情况下，如果用户秒杀成功了，下单之后，在15分钟之内还未完成支付的话，该订单会被自动取消，回退库存。
那么，在15分钟内未完成支付，订单被自动取消的功能，要如何实现呢？
我们首先想到的可能是job，因为它比较简单。
但job有个问题，需要每隔一段时间处理一次，实时性不太好。
还有更好的方案？
答：**使用延迟队列。**
**我们都知道rocketmq，自带了延迟队列的功能。**
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710943863081-6c4cfac2-8e5c-4067-9922-4acdbfc5cc4a.jpeg#averageHue=%23fbfafa&clientId=uf7da8455-ee45-4&from=paste&id=I2Wxd&originHeight=714&originWidth=1196&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ucc3e489d-e442-4cac-8439-074d0b6bc2d&title=)
下单时消息生产者会先生成订单，**此时状态为待支付**，然后会向延迟队列中发一条消息。达到了延迟时间，消息消费者读取消息之后，会查询该订单的状态是否为待支付。如果是待支付状态，则会更新订单状态为取消状态。如果不是待支付状态，说明该订单已经支付过了，则直接返回。
还有个关键点，用户完成支付之后，会修改订单状态为已支付。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/32717568/1710944031634-faed1338-0bb5-4023-b6b6-09fe710fd6f9.jpeg#averageHue=%23fbfbfb&clientId=uf7da8455-ee45-4&from=paste&id=R55vp&originHeight=546&originWidth=776&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u9aa9848d-36d6-4f06-85d0-fe896127ccf&title=)
<a name="Pp5lR"></a>

### 如何限流？

<a name="Gs79r"></a>

## Gee实现web框架

动态路由实现：
前缀树：

```go
package gee

import "strings"

type node struct {
	pattern  string  // 待匹配路由，例如 /p/:lang
	part     string  // 路由中的一部分，例如 :lang
	children []*node // 子节点，例如 [doc, tutorial, intro]
	isWild   bool    // 是否精确匹配，part 含有 : 或 * 时为true
}

// 第一个匹配成功的节点，用于插入
func (n *node) matchChild(part string) *node {
	for _, child := range n.children {
		if child.part == part || child.isWild {
			return child
		}
	}
	return nil
}

// 所有匹配成功的节点，用于查找
func (n *node) matchChildren(part string) []*node {
	nodes := make([]*node, 0)
	for _, child := range n.children {
		if child.part == part || child.isWild {
			nodes = append(nodes, child)
		}
	}
	return nodes
}

func (n *node) insert(pattern string, parts []string, height int) {
	if len(parts) == height {
		n.pattern = pattern
		return
	}

	part := parts[height]
	child := n.matchChild(part)
	if child == nil {
		child = &node{part: part, isWild: part[0] == ':' || part[0] == '*'}
		n.children = append(n.children, child)
	}
	child.insert(pattern, parts, height+1)
}

func (n *node) search(parts []string, height int) *node {
	if len(parts) == height || strings.HasPrefix(n.part, "*") {
		if n.pattern == "" {
			return nil
		}
		return n
	}

	part := parts[height]
	children := n.matchChildren(part)

	for _, child := range children {
		result := child.search(parts, height+1)
		if result != nil {
			return result
		}
	}

	return nil
}

```
