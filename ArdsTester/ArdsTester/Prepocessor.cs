using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    public class Prepocessor
    {
        public static string process(Request req)
        {
            var httpWReq = (HttpWebRequest)WebRequest.Create("http://localhost:2226/preprocessor/execute");

            var encoding = new ASCIIEncoding();

            string postData = Newtonsoft.Json.JsonConvert.SerializeObject(req);
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
                return responseString;
            //    var result = JObject.FromObject(JObject.Parse(responseString)["ResourceStatusChangeBusyResult"]);
            //    this.lbl_Code.Text = ((WorkflowResultCode)result["Command"].Value<int>()).ToString();
            //    this.lbl_Message.Text = result["ResultString"].Value<string>();
            }

            return string.Empty;
        }
    }
}
