using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    public class Request
    {
        public int Company { get; set; }
        public int Tenant { get; set; }
        public string Class { get; set; }
        public string Type { get; set; }
        public string Category { get; set; }
        public string SessionId { get; set; }
        public List<string> Attributes { get; set; }
        public string RequestServerId { get; set; }
        public string Priority { get; set; }
        public string OtherInfo { get; set; }

        public bool Add(string obj)
        {
            var httpWReq = (HttpWebRequest)WebRequest.Create("http://localhost:2225/request/add");

            var encoding = new ASCIIEncoding();

            string postData = obj;
            byte[] data = encoding.GetBytes(postData);

            httpWReq.Method = "POST";
            httpWReq.Accept = "application/json";
            httpWReq.ContentType = "application/json";
            httpWReq.ContentLength = data.Length;

            using (Stream stream = httpWReq.GetRequestStream())
            {
                stream.Write(data, 0, data.Length);
            }

            var response = (HttpWebResponse)httpWReq.GetResponse();

            if (response.StatusCode == HttpStatusCode.OK)
            {
                string responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();
                return bool.Parse(responseString);
                //    var result = JObject.FromObject(JObject.Parse(responseString)["ResourceStatusChangeBusyResult"]);
                //    this.lbl_Code.Text = ((WorkflowResultCode)result["Command"].Value<int>()).ToString();
                //    this.lbl_Message.Text = result["ResultString"].Value<string>();
            }

            return false;
        }

        public bool Remove(int company, int tenant, string sessionId)
        {
            var httpWReq = (HttpWebRequest)WebRequest.Create("http://localhost:2225/request/remove/"+company+"/"+tenant+"/"+sessionId+"");

            var encoding = new ASCIIEncoding();
            
            httpWReq.Method = "DELETE";
            httpWReq.Accept = "application/json";
            httpWReq.ContentType = "application/json";

            var response = (HttpWebResponse)httpWReq.GetResponse();

            if (response.StatusCode == HttpStatusCode.OK)
            {
                string responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();
                return bool.Parse(responseString);
                //    var result = JObject.FromObject(JObject.Parse(responseString)["ResourceStatusChangeBusyResult"]);
                //    this.lbl_Code.Text = ((WorkflowResultCode)result["Command"].Value<int>()).ToString();
                //    this.lbl_Message.Text = result["ResultString"].Value<string>();
            }

            return false;
        }
    }
}
