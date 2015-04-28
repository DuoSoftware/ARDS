using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                using (var host3 = new ServiceHost(typeof(CallbackTest)))
                using(var host1 = new ServiceHost(typeof(ContinueArds)))
                using (var host2 = new ServiceHost(typeof(StartArds)))
                {
                    host1.Open();
                    host2.Open();
                    host3.Open();
                    Console.WriteLine("Press Enter To Exit!");

                    Console.ReadLine();

                    while (true)
                    {
                        Console.ReadLine();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                Console.ReadLine();
            }
        }
    }
}
