using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    public class ReqQueue
    {
        public static bool AddToQueue(string obj)
        {
            try
            {
                var httpWReq = (HttpWebRequest)WebRequest.Create("http://localhost:2225/queue/add");

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
                    response.Close();
                    return bool.Parse(responseString);
                    //    var result = JObject.FromObject(JObject.Parse(responseString)["ResourceStatusChangeBusyResult"]);
                    //    this.lbl_Code.Text = ((WorkflowResultCode)result["Command"].Value<int>()).ToString();
                    //    this.lbl_Message.Text = result["ResultString"].Value<string>();
                }
                response.Close();
                return false;
            }
            catch (Exception e)
            {
                Console.WriteLine("AddToQueue :: " + e.Message);
                return false;
            }
        }

        public static bool ReAddToQueue(string obj)
        {
            try
            {
                var httpWReq = (HttpWebRequest)WebRequest.Create("http://localhost:2225/queue/readd");

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
                    response.Close();
                    Console.WriteLine("request readded success");
                    return bool.Parse(responseString);
                    //    var result = JObject.FromObject(JObject.Parse(responseString)["ResourceStatusChangeBusyResult"]);
                    //    this.lbl_Code.Text = ((WorkflowResultCode)result["Command"].Value<int>()).ToString();
                    //    this.lbl_Message.Text = result["ResultString"].Value<string>();
                }
                response.Close();
                return false;
            }
            catch (Exception e)
            {
                Console.WriteLine("ReAddToQueue :: " + e.Message);
                return false;
            }
        }

        public static void SetNextProcessingItem(string queueId, string processingHashId)
        {
            try
            {
                var httpWReq = (HttpWebRequest)WebRequest.Create("http://localhost:2225/queue/setnextprocessingitem");

                var encoding = new ASCIIEncoding();

                string postData = "{\"queueId\":\"" + queueId + "\",\"processingHashId\":\"" + processingHashId + "\"}";
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
                    response.Close();
                    string responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();
                    //return bool.Parse(responseString);
                    //    var result = JObject.FromObject(JObject.Parse(responseString)["ResourceStatusChangeBusyResult"]);
                    //    this.lbl_Code.Text = ((WorkflowResultCode)result["Command"].Value<int>()).ToString();
                    //    this.lbl_Message.Text = result["ResultString"].Value<string>();
                }

                response.Close();
            }
            catch (Exception e)
            {
                Console.WriteLine("SetNextProcessingItem :: " + e.Message);
            }
            //return false;
        }

        public static bool Remove(string queueId, string sessionId)
        {
            try
            {
                var httpWReq = (HttpWebRequest)WebRequest.Create("http://localhost:2225/queue/remove/" + queueId + "/" + sessionId + "");

                var encoding = new ASCIIEncoding();

                httpWReq.Method = "DELETE";
                httpWReq.Accept = "application/json";
                httpWReq.ContentType = "application/json";

                var response = (HttpWebResponse)httpWReq.GetResponse();

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();

                    response.Close();
                    return bool.Parse(responseString);
                    //    var result = JObject.FromObject(JObject.Parse(responseString)["ResourceStatusChangeBusyResult"]);
                    //    this.lbl_Code.Text = ((WorkflowResultCode)result["Command"].Value<int>()).ToString();
                    //    this.lbl_Message.Text = result["ResultString"].Value<string>();
                }

                response.Close();
                return false;
            }
            catch (Exception e)
            {
                Console.WriteLine("RemoveQueue :: " + e.Message);
                return false;
            }
        }
    }
}
