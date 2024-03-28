---
title: Go语言调用外部程序
author: 菠萝
email: 2493381254@qq.com
readmore: true
hideTime: true
categories: 后端
tag: 后端
date: 2023-10-7 13:04:41
abbrlink: 51848
---
> 由于最近开发碰到了需要调用外部软件程序的任务，对此有一定的兴趣，所以本人翻阅互联网，寻找如何操作，得此文章。

# Go语言调用外部程序

`os/exec`包中的exec.Commad()

~~~go
package main

import (
	"fmt"
	"os/exec"
	"runtime"
	"syscall"
)

const path = "D:\\tools\\wangyiyun\\CloudMusic\\cloudmusic.exe"

func main() {
	// 注意一第一个参数，其实就是你要运行的 .exe程序
	cmd := exec.Command(path)
	if runtime.GOOS == "windows" {
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	}

	err := cmd.Run()
	fmt.Println(err.Error())
}

~~~

`syscall`包下的CreateProcess()创建子进程来运行

~~~go
package main

import (
	"fmt"
	"syscall"
)

const path = "D:\\tools\\wangyiyun\\CloudMusic\\cloudmusic.exe"

func main() {

	//cmd := exec.Command(path)
	//if runtime.GOOS == "windows" {
	//	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	//}
	//err := cmd.Run()
	//fmt.Println(err.Error())

	var sI syscall.StartupInfo
	var pI syscall.ProcessInformation

	argv, err2 := syscall.UTF16PtrFromString(path)
	if err2 != nil {
		return
	}

	err := syscall.CreateProcess(
		nil,
		argv,
		nil,
		nil,
		true,
		0,
		nil,
		nil,
		&sI,
		&pI)

	fmt.Printf("Return: %d\n", err)
}
~~~

> 这是一个使用Go语言编写的Windows系统调用函数，用于创建一个新的进程。以下是代码的详细解释：
>
> 1. `func CreateProcess(appName *uint16, commandLine *uint16, procSecurity *SecurityAttributes, threadSecurity *SecurityAttributes, inheritHandles bool, creationFlags uint32, env *uint16, currentDir *uint16, startupInfo *StartupInfo, outProcInfo *ProcessInformation) (err error)`：定义了一个名为`CreateProcess`的函数，该函数接受10个参数，返回一个错误值（`err`）。这些参数的含义如下：
>    - `appName *uint16`：指向应用程序名称的字符串指针。
>    - `commandLine *uint16`：指向命令行参数的字符串指针。
>    - `procSecurity *SecurityAttributes`：指向进程安全属性的指针。
>    - `threadSecurity *SecurityAttributes`：指向线程安全属性的指针。
>    - `inheritHandles bool`：一个布尔值，表示是否继承句柄。
>    - `creationFlags uint32`：表示创建进程的标志。
>    - `env *uint16`：指向环境变量的指针。
>    - `currentDir *uint16`：指向当前目录的字符串指针。
>    - `startupInfo *StartupInfo`：指向启动信息的指针。
>    - `outProcInfo *ProcessInformation`：指向进程信息的指针。
> 2. `var _p0 uint32`：定义了一个名为`_p0`的变量，其类型为`uint32`。这个变量用于存储`inheritHandles`变量的值，如果`inheritHandles`为`true`，则将其设置为`1`，否则设置为`0`。
> 3. `if inheritHandles {`：如果`inheritHandles`为`true`，执行以下操作：
>    - `_p0 = 1`：将`_p0`设置为`1`。
> 4. `r1, _, e1 := Syscall12(procCreateProcessW.Addr(), 10, uintptr(unsafe.Pointer(appName)), uintptr(unsafe.Pointer(commandLine)), uintptr(unsafe.Pointer(procSecurity)), uintptr(unsafe.Pointer(threadSecurity)), uintptr(_p0), uintptr(creationFlags), uintptr(unsafe.Pointer(env)), uintptr(unsafe.Pointer(currentDir)), uintptr(unsafe.Pointer(startupInfo)), uintptr(unsafe.Pointer(outProcInfo)), 0, 0)`：使用`Syscall12`函数调用Windows系统调用的地址（`procCreateProcessW.Addr()`），传递10个参数。这些参数的含义如下：
>    - `procCreateProcessW.Addr()`：表示`CreateProcess`系统调用的地址。
>    - `10`：表示参数的数量。
>    - `uintptr(unsafe.Pointer(appName))`：表示`appName`参数的地址。
>    - `uintptr(unsafe.Pointer(commandLine))`：表示`commandLine`参数的地址。
>    - `uintptr(unsafe.Pointer(procSecurity))`：表示`procSecurity`参数的地址。
>    - `uintptr(unsafe.Pointer(threadSecurity))`：表示`threadSecurity`参数的地址。
>    - `uintptr(_p0)`：表示`_p0`参数的地址。
>    - `uintptr(creationFlags)`：表示`creationFlags`参数的地址。
>    - `uintptr(unsafe.Pointer(env))`：表示`env`参数的地址。
>    - `uintptr(unsafe.Pointer(currentDir))`：表示`currentDir`参数的地址。
>    - `uintptr(unsafe.Pointer(startupInfo))`：表示`startupInfo`参数的地址。
>    - `uintptr(unsafe.Pointer(outProcInfo))`：表示`outProcInfo`参数的地址。
>    - `0`：表示`_p0`参数的长度。
>    - `0`：表示`_p0`参数的字节顺序。
> 5. `if r1 == 0 {`：如果`Syscall12`函数返回的第一个返回值为`0

~~~go
func CreateProcess(appName *uint16, commandLine *uint16, procSecurity *SecurityAttributes, threadSecurity *SecurityAttributes, inheritHandles bool, creationFlags uint32, env *uint16, currentDir *uint16, startupInfo *StartupInfo, outProcInfo *ProcessInformation) (err error) {
	var _p0 uint32
	if inheritHandles {
		_p0 = 1
	}
	r1, _, e1 := Syscall12(procCreateProcessW.Addr(), 10, uintptr(unsafe.Pointer(appName)), uintptr(unsafe.Pointer(commandLine)), uintptr(unsafe.Pointer(procSecurity)), uintptr(unsafe.Pointer(threadSecurity)), uintptr(_p0), uintptr(creationFlags), uintptr(unsafe.Pointer(env)), uintptr(unsafe.Pointer(currentDir)), uintptr(unsafe.Pointer(startupInfo)), uintptr(unsafe.Pointer(outProcInfo)), 0, 0)
	if r1 == 0 {
		err = errnoErr(e1)
	}
	return
}
~~~
