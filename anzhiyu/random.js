var posts=["2023/06/12/Axios/","2023/07/06/CAP/","2023/05/12/DDD/","2023/12/12/Docker/","2023/10/14/Flutter/","2024/03/06/Go面试题/","2023/09/10/Hadoop-分布式文件系统HDFS/","2023/07/09/JWT/","2023/11/18/Jaeger/","2023/10/11/React/","2024/03/30/Redis源码阅读系列0/","2023/12/24/Redis源码阅读系列1/","2023/12/16/Redis线程模型/","2023/08/03/UML/","2023/09/12/WWH-01/","2024/02/18/analytics/","2023/08/12/canal/","2023/09/12/cron/","2023/12/20/flutter打包程序/","2023/11/08/go时间处理/","2023/11/14/go系统监控/","2023/10/03/go语言泛型/","2023/10/07/go调用外部程序/","2023/06/12/hello-world/","2024/03/16/k8s/","2023/11/08/kafka/","2023/12/16/prometheus/","2024/03/11/redsync/","2023/10/07/sqlx和sqlc/","2024/03/13/云原生/","2024/03/23/云原生1/","2023/10/08/前端文件上传/","2024/03/29/华为上机考试准备/","2024/03/28/华为面经系列01/","2024/03/28/博客搭建/","2024/03/07/学习记录/","2023/12/08/接口测试/","2023/12/08/数据库分片/","2023/09/03/有栈协程和无栈协程/","2024/03/02/简历制作/","2023/11/04/系统测试/","2023/12/10/认证授权/","2023/12/11/设计模式/","2023/11/02/软件测试/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };