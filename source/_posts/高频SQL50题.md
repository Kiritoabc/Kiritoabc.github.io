---
title: 高频SQL50题
author: 菠萝
email: 2493381254@qq.com
readmore: true
hideTime: true
categories: 后端
tag: SQL
date: 2024-04-08 21:46:41
cover:
---



# LeetCode高频SQL 50题

> 地址: https://leetcode.cn/studyplan/sql-free-50/



## 查询

[1757. 可回收且低脂的产品](https://leetcode.cn/problems/recyclable-and-low-fat-products/)

~~~mysql
# Write your MySQL query statement below
select product_id from Products
    where low_fats = 'Y'
    and recyclable = 'Y';
~~~



[584. 寻找用户推荐人](https://leetcode.cn/problems/find-customer-referee/)

~~~mysql
# Write your MySQL query statement below
select name from Customer 
    where  ifnull(referee_id,0) != 2;
~~~



[595. 大的国家](https://leetcode.cn/problems/big-countries/)

~~~mysql
# Write your MySQL query statement below
select name , population, area 
    from World 
    where area >= 3000000 
    or population >= 25000000 ;
~~~



[1148. 文章浏览 I](https://leetcode.cn/problems/article-views-i/)

~~~mysql
# Write your MySQL query statement below
select distinct author_id as id
    from Views 
    where author_id = viewer_id 
    order by id asc;
~~~



[1683. 无效的推文](https://leetcode.cn/problems/invalid-tweets/)

~~~mysql
# Write your MySQL query statement below
select tweet_id from Tweets 
    where length(content) > 15; 
~~~





## 连接

