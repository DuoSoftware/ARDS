using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    public class CallbackTest:ICallbackTest
    {
        public void PrintResult(string result)
        {
            Console.WriteLine(result);
        }
    }
}
