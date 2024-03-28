---
title: Docker基础
author: 菠萝
email: 2493381254@qq.com
readmore: true
hideTime: true
cover:
categories: 后端
tag: 后端开发知识
date: 2023-12-12 13:04:41
abbrlink: 16621
---
> 记录Docker的一些应用

# 如何编写Dockerfile文件部署go项目

> 对于项目而言，我们要将所有项目编排在容器中，一般容器与容器之间的交互可以通过ip，
> 但是比较麻烦，所以，这里推荐使用docker的network，将所有容器都存放在一个网络中，
> 这样子容器之间的通信就相对比较容易。

<!-- more -->

1. 如何创建网络，使用命令

~~~Shell
docker network create networkName
~~~

2. 使用docker network connect连接到创建的网络

~~~Shell
docker network connect networkName dockerName
~~~

3. 我们可以通过以下命令查看该网络下的连接

~~~Shell
docker network inspect networkName
~~~

通过网络就可以使用容器命进行通信了

> 已经将我们要的容器添加至同一network中后，就可以开始编写我们的dockerfile了。

Dockerfile操作指令如下

~~~dockerfile
  指令                                            含义
FROM 镜像                            指定新镜像所基于的镜像，第一条指令必须为FROM指令,每创建一个镜像就需要一条FROM指令

MAINTAINER 名字                      说明新镜像的维护人信息

RUN命令                              在所基于的镜像上执行命令，并提交到新的镜像中

CMD [”要运行的程序”，”参数1,"参数2 "]   指令启动容器时要运行的命令或者脚本，Dockerfile只能有一条CMD命令， 如果指定多条则只能最后一条被执行

EXPOSE 端口号                         指定新镜像加载到Docker时要开启的端口

ENV  环境变量  变量值                  设置一个环境变量的值，会被后面的RUN使用

ADD 源文件/目录目标文件/目录            将源文件复制到目标文件，源文件要与Dockerfile位于相同目录中，或者是一个URL

COPY 源文件/目录目标文件/目录           将本地主机上的文件/目录复制到目标地点，源文件/目录要与Dockerfile在相同的目录中

VOLUME [“目录"]                      在容器中创建一个挂载点

USER 用户名/UID                       指定运行容器时的用户

WORKDIR 路径（类似cd）                为后续的RUN、CMD、ENTRYPOINT指定工作自录

ONBUILD 命令                         指定所生成的镜像作为一个基础镜像时所要运行的命令

HEALTHCHECK                         健康检查

~~~

**dockerfilke文件如下**

~~~dockerfile
FROM golang:1.21 as builder

WORKDIR /App
COPY . .

RUN go env -w GO111MODULE=on \
    && go env -w GOPROXY=https://goproxy.cn,direct \
    && go env -w CGO_ENABLED=0 \
    && go env \
    && go mod tidy \
    && go build -o server .

FROM alpine:latest

LABEL MAINTAINER="2493381254@qq.com"

WORKDIR /App

COPY --from=0 /App ./
COPY --from=0 /App/config.docker.yaml ./

EXPOSE 8888
ENTRYPOINT ./server -c config.docker.yaml

~~~

> 使用dockerfile文件构建我们的镜像

命令：

~~~powershell
docker build -t qpp-demo -f ./Dockerfile ./
~~~

-t 指定镜像的名称，如果要指定版本，采用 image:tag 的写法。

-f 指定Dockerfile文件，默认当前文件夹下的Dockerfile。

启动镜像

~~~powershell
docker run -d --net=app-demo-net -p 8888:8888 --name my-app-docker app-demo
~~~

donfig.docker.yaml配置文件如下

~~~yam

# zap logger 的配置
zap:
  level: info
  format: console
  prefix: "[Chinese_Learning_App]"
  director: log
  show-line: true
  encode-level: LowercaseColorLevelEncoder
  stacktrace-key: stacktrace
  log-in-console: true



# redis configuration
#redis:
#  db: 0
#  addr: 127.0.0.1:6379
#  password: ""


# system configuration
system:
  env: public # Change to "develop" to skip authentication for development mode
  addr: 8888
  db-type: mysql
  oss-type: local # 控制oss选择走本地还是 七牛等其他仓 自行增加其他oss仓可以在 server/utils/upload/upload.go 中 NewOss函数配置
  use-redis: false # 使用redis
  use-multipoint: false
  # IP限制次数 一个小时15000次
  iplimit-count: 15000
  #  IP限制一个小时
  iplimit-time: 3600
  #  路由全局前缀
  router-prefix: ""


# mysql connect configuration
# 未初始化之前请勿手动修改数据库信息！！！如果一定要手动初始化请看（https://gin-vue-admin.com/docs/first_master）
mysql:
  path: docker_mysql
  port: "3306"
  config: "charset=utf8mb4&parseTime=True&loc=Local"
  db-name: "Chinese_Learning_DB"
  username: "root"
  password: "123456"
  max-idle-conns: 10
  max-open-conns: 100
  log-mode: ""
  log-zap: false


# MinIo的配置
minio:
  endpoint: my_minio:9001           # minio 的url
  accessKey: minio                              # userName
  secretKey: minio@123456                       # password
  bucketName: "test"
  region: us-east-1
  useSSL: false
~~~

# docker compose的使用
