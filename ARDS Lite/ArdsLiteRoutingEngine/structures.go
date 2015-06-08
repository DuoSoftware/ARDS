package main

//Configurations

type Configuration struct {
	RedisIp          string
	RedisDb          int
	ArdsContinueUrl  string
	ResourceCSlotUrl string
}

//Request

type ReqAttributeData struct {
	AttributeCode     []string
	AttributeClass    string
	AttributeType     string
	AttributeCategory string
	WeightPrecentage  string
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

type ReqMetaData struct {
	MaxReservedTime int
	MaxRejectCount  int
}

//Resource

type ResAttributeData struct {
	Attribute  string
	Class      string
	Type       string
	Category   string
	Percentage float64
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

type ConcurrencyInfo struct {
	RejectCount       int
	ResourceId        string
	LastConnectedTime string
}

type WeightBaseResourceInfo struct {
	ResourceId string
	Weight     float64
}
