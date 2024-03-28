---
title: Go泛型
author: 菠萝
email: 2493381254@qq.com
readmore: true
hideTime: true
categories: 后端
tag: 后端Go
date: 2023-10-03 13:04:41
abbrlink: 55519
---
# Go 1.18 泛型

> 2022年3月15日，争议非常大但同时也备受期待的泛型终于伴随着Go1.18发布了。

参考文档: [Go 编程语言规范 - Go 编程语言](https://go.dev/ref/spec)

<!-- more -->

**Go还引入了非常多全新的概念：**

- 类型形参 (Type parameter)
- 类型实参(Type argument)
- 类型形参列表( Type parameter list)
- 类型约束(Type constraint)
- 实例化(Instantiations)
- 泛型类型(Generic type)
- 泛型接收器(Generic receiver)
- 泛型函数(Generic function)

## 类型形参，类型实参，类型约束，泛型类型

~~~go
type IntSlice []int

var a IntSlice = []int{1, 2, 3} // 正确
var b IntSlice = []float32{1.0, 2.0, 3.0} // ✗ 错误，因为IntSlice的底层类型是[]int，浮点类型的切片无法赋值
~~~

这里定义了一个新的类型 `IntSlice` ，它的底层类型是 `[]int` ，理所当然只有int类型的切片能赋值给 `IntSlice` 类型的变量。

接下来如果我们想要定义一个可以容纳 `float32` 或 `string` 等其他类型的切片的话该怎么办？

~~~go
type StringSlice []string
type Float32Slie []float32
type Float64Slice []float64
~~~

但是这样做的问题显而易见，它们结构都是一样的只是成员类型不同就需要重新定义这么多新类型。那么有没有一个办法能只定义一个类型就能代表上面这所有的类型呢？

~~~Go
type Slice[T int|float32|float64 ] []T
~~~

## 泛型函数

~~~go
func Add(a int, b int) int {
    return a + b
}

func Add[T int | float32 | float64](a T, b T) T {
    return a + b
}
~~~
