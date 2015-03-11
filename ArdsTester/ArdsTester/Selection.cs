using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    public class Selection
    {
        public static string BasicSelection(int company, int tenant, string sessionid)
        {
            var httpWReq = (HttpWebRequest)WebRequest.Create("http://localhost:2228/SelectionAlgo/Select/BasicSelection/" + company + "/"+tenant+"/"+sessionid+"");
            
            var encoding = new ASCIIEncoding();

            httpWReq.Method = "GET";
            httpWReq.Accept = "application/json";
            httpWReq.ContentType = "application/json";

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
