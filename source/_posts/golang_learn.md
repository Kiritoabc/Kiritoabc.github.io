---
title: time/rate包的使用
author: 菠萝
email: 2493381254@qq.com
readmore: true
hideTime: true
categories: 后端
tag: 后端go
date: 2024-04-04 13:04:41
cover:
---

# Golang限流器time/rate

> golang标准库中就自带了限流算法的实现，即`golang.org/x/time/rate`。 该限流器是基于Token Bucket(令牌桶)实现的。



## time/rate包的使用

**创建一个限流器：**

~~~go
limiter := NewLimiter(10,1)
~~~

这里有两个参数：

1. 第一个参数是 `r Limit`。代表每秒可以向 Token 桶中产生多少 token。Limit 实际上是 float64 的别名。
2. 第二个参数是 `b int`。b 代表 Token 桶的容量大小。

那么，对于以上例子来说，其构造出的限流器含义为，其令牌桶大小为 1, 以每秒 10 个 Token 的速率向桶中放置 Token。

除了直接指定每秒产生的 Token 个数外，还可以用 Every 方法来指定向 Token 桶中放置 Token 的间隔，例如：

```go
limit := Every(100 * time.Millisecond);
limiter := NewLimiter(limit, 1);
```

以上就表示每 100ms 往桶中放一个 Token。本质上也就是一秒钟产生 10 个。

Limiter 提供了三类方法供用户消费 Token，用户可以每次消费一个 Token，也可以一次性消费多个 Token。
而每种方法代表了当 Token 不足时，各自不同的对应手段。



**常用的几种方法：**

**wait/waitN**

**allow/allowN**

**Reserve/ReserveN**



## 源码解析

**Limiter的结构体**

~~~go
type Limiter struct {
	mu     sync.Mutex	// 互斥锁
	limit  Limit		// 每秒生成 token 的速率
	burst  int			// 桶容量的大小
	tokens float64		// 令牌个数
	// last is the last time the limiter's tokens field was updated
	last time.Time		// 上次更新 tokens 的时间
	// lastEvent is the latest time of a rate-limited event (past or future)
	lastEvent time.Time		// lastEvent是受速率限制的事件的最新时间(过去或将来)
}
~~~

