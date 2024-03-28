---
title: sqlc和sqlx的使用
author: 菠萝
email: 2493381254@qq.com
readmore: true
hideTime: true
categories: 后端
cover:
tag: 后端开发小技巧
date: 2023-10-07 13:04:41
abbrlink: 13343
---
# 什么是sqlc和sqlx?

> github上有解释，可以自行查找
>
> - https://github.com/sqlc-dev/sqlc
> - https://github.com/jmoiron/sqlx

![1702875673126](sqlx和sqlc/1702875673126.png)

![1702875683569](sqlx和sqlc/1702875683569.png)

<!-- more -->

# sqlx的使用

## sqlx连接数据库--Connect

> 连接mysql数据库

~~~go
import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

var DB *sqlx.DB

func initMysql() (err error) {
	dsn := "root:123456@tcp(127.0.0.1:3306)/demo"
	DB, err = sqlx.Connect("mysql", dsn)
	if err != nil {
		_ = fmt.Sprintf("database connect error: %v\n", err)
		return err
	}
	DB.SetMaxOpenConns(200)
	DB.SetMaxIdleConns(20)
	return
}
~~~

## sqlx查询数据--Get,Select

> 查询单行记录可以使用

~~~go
type User struct {
	Id        int64  `db:"id"`
	Age       int64  `db:"age"`
	FirstName string `db:"firstName"`
	LastName  string `db:"lastName"`
}

func QueryRowById(id int64) (user User, err error) {
	err = DB.Get(&user, "select * from user where id = ?", id)
	if err != nil {
		return
	}
	return
}
~~~

> 查询多行记录

~~~go
func SelectMData() ([]*User, error) {
	var list []*User
	err := DB.Select(&list, "select * from user order by id desc")
	if err != nil {
		return list, err
	}
	return list, err
}
~~~

## sqlx的Exec执行sql

> Exec and MustExec get a connection from the connection pool and executes the provided query on the server. For drivers that do not support ad-hoc query execution, a prepared statement *may* be created behind the scenes to be executed. The connection is returned to the pool before the result is returned.

~~~go

func ExecSQL() {
	schema := `CREATE TABLE place (
    country text,
    city text NULL,
    telcode integer);`
	result, err := DB.Exec(schema)
	if err != nil {
		return
	}
	fmt.Println(result)
	// or, you can use MustExec, which panics on error
	cityState := `INSERT INTO place (country, telcode) VALUES (?, ?)`
	countryCity := `INSERT INTO place (country, city, telcode) VALUES (?, ?, ?)`
	DB.MustExec(cityState, "Hong Kong", 852)
	DB.MustExec(cityState, "Singapore", 65)
	DB.MustExec(countryCity, "South Africa", "Johannesburg", 27)
}
~~~

## sqlx绑定数据

> - MySQL uses the `?` variant shown above
> - PostgreSQL uses an enumerated `$1`, `$2`, etc bindvar syntax
> - SQLite accepts both `?` and `$1` syntax
> - Oracle uses a `:name` syntax

## sqlx查询--Query

> Query is the primary way to run queries with database/sql that return row results. Query returns an `sql.Rows` object and an error:

Query的使用

~~~go
func QueryDemo() {
	// 查询数据库
	rows, err := DB.Query("select * from user")
	if err != nil {
		return
	}
	// 迭代器取数据
	for rows.Next() {
		var id int64
		var firstNam string
		var lastname string
		var age int64
		rows.Scan(&id, &firstNam, &lastname, &age)
		fmt.Printf("id:%d, firstname:%s, lastname:%s, age:%d\n", id, firstNam, lastname, age)
	}
}
~~~

Queryx使用

> The sqlx extension `Queryx` behaves exactly as Query does, but returns an `sqlx.Rows`, which has extended scanning behaviors:

~~~go
func QueryxDemo() {
	rows, err := DB.Queryx("select * from user")
	if err != nil {
		return
	}
	for rows.Next() {
		var u User
		err := rows.StructScan(&u)
		if err != nil {
			return
		}
		fmt.Printf("id:%d, firstname:%s, lastname:%s, age:%d\n", u.Id, u.FirstName, u.LastName, u.Age)
	}
}
~~~

## sqlx的Transactions

> To use transactions, you must create a transaction handle with `DB.Begin()`. Code like this **will not work**:

~~~go
// this will not work if connection pool > 1
db.MustExec("BEGIN;")
db.MustExec(...)
db.MustExec("COMMIT;")
~~~

请记住，Exec和所有其他查询谓词都会向DB请求连接，然后每次将其返回到池中。不能保证您将接收到执行BEGIN语句的相同连接。因此，要使用事务，必须使用DB.Begin()

~~~go
tx, err := db.Begin()
err = tx.Exec(...)
err = tx.Commit()

// 或者
tx := db.MustBegin()
tx.MustExec(...)
err = tx.Commit()
~~~

## sqlx的Prepared Statements

~~~go
stmt, err := db.Prepare(`SELECT * FROM place WHERE telcode=?`)
row = stmt.QueryRow(65)
 
tx, err := db.Begin()
txStmt, err := tx.Prepare(`SELECT * FROM place WHERE telcode=?`)
row = txStmt.QueryRow(852)

// Preparex
stmt, err := db.Preparex(`SELECT * FROM place WHERE telcode=?`)
var p Place
err = stmt.Get(&p, 852)
~~~

## sqlx--Query Helpers

In Queries

~~~go
SELECT * FROM users WHERE level IN (?);

var levels = []int{4, 6, 7}
rows, err := db.Query("SELECT * FROM users WHERE level IN (?);", levels)


var levels = []int{4, 6, 7}
query, args, err := sqlx.In("SELECT * FROM users WHERE level IN (?);", levels)
// sqlx.In returns queries with the `?` bindvar, we can rebind it for our backend
query = db.Rebind(query)
rows, err := db.Query(query, args...)
~~~

Named Queries

~~~go
// named query with a struct
p := Place{Country: "South Africa"}
rows, err := db.NamedQuery(`SELECT * FROM place WHERE country=:country`, p)
 
// named query with a map
m := map[string]interface{}{"city": "Johannesburg"}
result, err := db.NamedExec(`SELECT * FROM place WHERE city=:city`, m)




p := Place{TelephoneCode: 50}
pp := []Place{}
// select all telcodes > 50
nstmt, err := db.PrepareNamed(`SELECT * FROM place WHERE telcode > :telcode`)
err = nstmt.Select(&pp, p)


arg := map[string]interface{}{
    "published": true,
    "authors": []{8, 19, 32, 44},
}
query, args, err := sqlx.Named("SELECT * FROM articles WHERE published=:published AND author_id IN (:authors)", arg)
query, args, err := sqlx.In(query, args...)
query = db.Rebind(query)
db.Query(query, args...)
~~~

## sqlx--Controlling Name Mapping

用作StructScans目标的结构字段必须大写，以便sqlx可以访问。因此，sqlx使用NameMapper来应用字符串。降低字段名称以将它们映射到行结果中的列。这并不总是理想的，这取决于您的模式，因此sqlx允许以多种方式定制映射。

其中最简单的方法是使用sqlx.DB为数据库句柄设置它。MapperFunc，它接收一个func(string) string类型的参数。如果你的库需要一个特定的映射器，并且你不想毒害你收到的sqlx.DB，你可以创建一个副本在库中使用，以确保一个特定的默认映射:

~~~go
// if our db schema uses ALLCAPS columns, we can use normal fields
db.MapperFunc(strings.ToUpper)
 
// suppose a library uses lowercase columns, we can create a copy
copy := sqlx.NewDb(db.DB, db.DriverName())
copy.MapperFunc(strings.ToLower)
~~~

每个sqlx. db使用sqlx/reflectx包的映射器来实现底层映射，并将活动映射器公开为sqlx. db .Mapper。您可以通过直接设置来进一步定制DB上的映射:

~~~go
import "github.com/jmoiron/sqlx/reflectx"
 
// Create a new mapper which will use the struct field tag "json" instead of "db"
db.Mapper = reflectx.NewMapperFunc("json", strings.ToLower)
~~~

## sqlx-- Connection Pool

> Statement preparation and query execution require a connection, and the DB object will manage a pool of them so that it can be safely used for concurrent querying. There are two ways to control the size of the connection pool as of Go 1.2:

- `DB.SetMaxIdleConns(n int)`
- `DB.SetMaxOpenConns(n int)`

默认情况下，池无限制地增长，只要池中没有可用的空闲连接，就会创建连接。您可以使用DB。SetMaxOpenConns设置池的最大大小。未使用的连接被标记为空闲，如果不需要则关闭。为了避免建立和关闭大量连接，请使用DB设置最大空闲大小。SetMaxIdleConns设置为适合您的查询负载的大小。

一不小心抓住关系不放很容易惹上麻烦。为了防止这种情况:

- 确保Scan()每个Row对象
- 确保使用Close()或通过Next()对每个Rows对象进行完全迭代
- 确保每个事务通过Commit()或Rollback()返回其连接

如果您忽略了这些事情中的一件，它们使用的连接可能会被保留到垃圾收集，并且您的数据库最终将立即创建更多的连接以补偿它使用的连接。注意，Rows.Close()可以安全地调用多次，所以不要害怕在不必要的地方调用它。

# sqlx + Squirrel

**Squirrel**

> **Squirrel is not an ORM.** For an application of Squirrel, check out [structable, a table-struct mapper](https://github.com/Masterminds/structable)

~~~go
package main

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)
import sq "github.com/Masterminds/squirrel"

var DB *sqlx.DB

func initMysql() (err error) {
	dsn := "root:123456@tcp(127.0.0.1:3306)/demo"
	DB, err = sqlx.Connect("mysql", dsn)
	if err != nil {
		_ = fmt.Sprintf("database connect error: %v\n", err)
		return err
	}
	DB.SetMaxOpenConns(200)
	DB.SetMaxIdleConns(20)
	return
}

func main() {
	fmt.Println("hello squirrel")
	_ = initMysql()
	sql, args, err := sq.Select("*").
		From("user").
		Where(sq.Eq{"id": 2}).ToSql()
	fmt.Printf("sql: %s, args: %v, err: %v\n", sql, args[0], err)
	// select * from user where id = 2
	var id int64
	var firstNam string
	var lastname string
	var age int64

	err = DB.QueryRow(sql, args...).
		Scan(&id, &age, &firstNam, &lastname)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Printf("id:%d, firstname:%s, lastname:%s, age:%d\n", id, firstNam, lastname, age)
}
~~~
