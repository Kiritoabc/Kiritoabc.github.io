var posts=["2024/03/28/Axios/","2024/03/28/CAP/","2024/03/28/DDD/","2024/03/28/Docker/","2024/03/28/Flutter/","2024/03/28/Go面试题/","2024/03/28/Hadoop-分布式文件系统HDFS/","2024/03/28/JWT/","2024/03/28/Jaeger/","2024/03/28/React/","2024/03/28/Redis源码阅读系列0/","2024/03/28/Redis源码阅读系列1/","2024/03/28/Redis线程模型/","2024/03/28/UML/","2024/03/28/WWH-01/","2024/02/18/analytics/","2024/03/28/canal/","2024/03/28/cron/","2024/03/28/flutter打包程序/","2024/03/28/go时间处理/","2024/03/28/go系统监控/","2024/03/28/go语言泛型/","2024/03/28/go调用外部程序/","2024/03/28/hello-world/","2024/03/28/k8s/","2024/03/28/kafka/","2024/03/28/prometheus/","2024/03/11/redsync/","2024/03/28/sqlx和sqlc/","2024/03/28/云原生/","2024/03/28/云原生1/","2024/03/28/前端文件上传/","2024/03/28/博客搭建/","2024/03/28/学习记录/","2024/03/28/接口测试/","2024/03/28/数据库分片/","2024/03/28/有栈协程和无栈协程/","2024/03/28/简历制作/","2024/03/28/系统测试/","2024/03/28/认证授权/","2024/03/28/设计模式/","2024/03/28/软件测试/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };