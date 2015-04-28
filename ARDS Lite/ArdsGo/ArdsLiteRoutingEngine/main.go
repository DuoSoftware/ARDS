// ArdsRoutingEngine project main.go
package main

import (
	"code.google.com/p/gorest"
	"fmt"
	"net/http"
	"time"
)

type Configuration struct {
	RedisIp          string
	RedisDb          int
	ArdsContinueUrl  string
	ResourceCSlotUrl string
}

type ReqAttributeData struct {
	AttributeCode     []string
	AttributeClass    string
	AttributeType     string
	AttributeCategory string
	WeightPrecentage  string
}

type ResAttributeData struct {
	Attribute  string
	Class      string
	Type       string
	Category   string
	Precentage float64
}

type Resource struct {
	Company               int
	Tenant                int
	Class                 string
	Type                  string
	Category              string
	ResourceId            string
	ResourceAttributeInfo []ResAttributeData
	OtherInfo             string
}

type Request struct {
	Company          int
	Tenant           int
	Class            string
	Type             string
	Category         string
	SessionId        string
	ArriveTime       string
	Priority         string
	QueueId          string
	ReqHandlingAlgo  string
	ReqSelectionAlgo string
	ServingAlgo      string
	HandlingAlgo     string
	SelectionAlgo    string
	RequestServerUrl string
	HandlingResource string
}

type RequestSelection struct {
	Company       int
	Tenant        int
	Class         string
	Type          string
	Category      string
	SessionId     string
	AttributeInfo []ReqAttributeData
}

type CSlotInfo struct {
	Company          int
	Tenant           int
	Class            string
	Type             string
	Category         string
	State            string
	HandlingRequest  string
	ResourceId       string
	SlotId           int
	ObjKey           string
	SessionId        string
	LastReservedTime string
	OtherInfo        string
}

type ReqMetaData struct {
	MaxReservedTime int
	MaxRejectCount  int
}

type ConcurrencyInfo struct {
	RejectCount       int
	ResourceId        string
	LastConnectedTime string
}

const layout = "2006-01-02T15:04:05Z07:00"

func main() {
	fmt.Println("Starting Ards Route Engine")
	InitiateRedis()
	go InitiateService()
	for {
		//fmt.Println("Searching...")
		availablePHashes := GetAllProcessingHashes()
		for _, h := range availablePHashes {
			go ExecuteRequestHash(h)
		}
		time.Sleep(200 * time.Millisecond)
	}
}

func InitiateService() {
	gorest.RegisterService(new(ArdsLiteRS))
	http.Handle("/", gorest.Handle())
	http.ListenAndServe(":2223", nil)
}

func AppendIfMissingReq(dataList []Request, i Request) []Request {
	for _, ele := range dataList {
		if ele == i {
			return dataList
		}
	}
	return append(dataList, i)
}

func AppendIfMissingString(dataList []string, i string) []string {
	for _, ele := range dataList {
		if ele == i {
			return dataList
		}
	}
	return append(dataList, i)
}

type timeSliceReq []Request
type ByStringValue []string
type timeSlice []ConcurrencyInfo

func (p timeSliceReq) Len() int {
	return len(p)
}
func (p timeSliceReq) Less(i, j int) bool {
	t1, _ := time.Parse(layout, p[i].ArriveTime)
	t2, _ := time.Parse(layout, p[j].ArriveTime)
	return t1.Before(t2)
}
func (p timeSliceReq) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}

func (a ByStringValue) Len() int           { return len(a) }
func (a ByStringValue) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByStringValue) Less(i, j int) bool { return a[i] < a[j] }

func (p timeSlice) Len() int {
	return len(p)
}
func (p timeSlice) Less(i, j int) bool {
	t1, _ := time.Parse(layout, p[i].LastConnectedTime)
	t2, _ := time.Parse(layout, p[j].LastConnectedTime)
	return t1.After(t2)
}
func (p timeSlice) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}
