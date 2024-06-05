import React from 'react';

export default function Testimonials() {
  const testimonials = [
    { name: "Ali Khan", occupation: "Engineer", comment: "Their water tanker booking service is top-notch. Will use again!" },
    { name: "Sana Ahmed", occupation: "Teacher", comment: "Booking a water tanker was so convenient with them. Highly recommended!" },
    { name: "Zubair Malik", occupation: "Doctor", comment: "Great service! Always on time with water tanker deliveries." },
    { name: "Farah Aslam", occupation: "Student", comment: "Easy and hassle-free booking process. Will definitely use their service again." },
    { name: "Imran Khan", occupation: "Architect", comment: "Their water tanker service is reliable and efficient. I've never been disappointed." },
    { name: "Nida Shah", occupation: "Writer", comment: "Booking a water tanker has never been this easy. Thank you for the great service!" },
    { name: "Rizwan Haider", occupation: "Businessman", comment: "Quick and efficient service. Definitely recommended for water tanker bookings." },
    { name: "Sadia Malik", occupation: "Lawyer", comment: "Their water tanker service is exceptional. Always on time and courteous." },
    { name: "Tariq Hussain", occupation: "Accountant", comment: "Booking a water tanker with them is a breeze. Professional and reliable service." },
    { name: "Yusra Khan", occupation: "Artist", comment: "I've been using their water tanker service for years now. Always satisfied with their service." },
    { name: "Bilal Ahmed", occupation: "Chef", comment: "Their water tanker booking platform is user-friendly and efficient. Highly recommended!" },
    { name: "Sadia Ahmed", occupation: "Consultant", comment: "Booking a water tanker has never been this convenient. Will definitely use their service again." },
    { name: "Faisal Khan", occupation: "Entrepreneur", comment: "Great service and prompt delivery. Will definitely continue using their water tanker service." },
    { name: "Hina Ali", occupation: "Designer", comment: "Their water tanker service is reliable and trustworthy. Always satisfied with their service." },
    { name: "Jamal Khan", occupation: "Photographer", comment: "Efficient and professional service. Booking a water tanker was a breeze with them." },
    { name: "Nadia Khan", occupation: "HR Manager", comment: "I highly recommend their water tanker service. Always prompt and reliable." },
    { name: "Sohail Ahmed", occupation: "Pilot", comment: "Their water tanker service is top-notch. Always satisfied with their prompt delivery." },
    { name: "Zara Malik", occupation: "Event Planner", comment: "Booking a water tanker with them is hassle-free. Professional and efficient service." },
    { name: "Ayesha Khan", occupation: "Dentist", comment: "Their water tanker service is excellent. Always on time and reliable." },
    { name: "Fahad Ali", occupation: "Marketing Manager", comment: "I've been using their water tanker service for years. Always satisfied with their professional service." }
  ];

  return (
    <div>
      <section id="testimonies" className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-8 md:mx-10 lg:mx-20 xl:mx-auto">

          <div className="transition duration-500 ease-in-out transform scale-100 translate-x-0 translate-y-0 opacity-100">
            <div className="mb-12 space-y-5 md:mb-16 md:text-center">
              <div className="inline-block px-3 py-1 text-sm font-semibold text-indigo-100 rounded-lg md:text-center text-cn bg-[#202c47] bg-opacity-60 hover:cursor-pointer hover:bg-opacity-40">
                Testimonials
              </div>
              <h1 className="mb-5 text-3xl font-semibold text-white md:text-center md:text-5xl">
                It's more than a service.
              </h1>
              <p className="text-xl text-gray-100 md:text-center md:text-2xl">
                Embark on a journey of effortless water tanker bookings with us.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="text-sm leading-6">
                <div className="relative group">
                  <div className="absolute transition rounded-lg opacity-25 -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 blur duration-400 group-hover:opacity-100 group-hover:duration-200"></div>
                  <a href="#" className="cursor-pointer">
                    <div className="relative p-6 space-y-6 leading-none rounded-lg bg-slate-800 ring-1 ring-gray-900/5">
                      <div className="flex items-center space-x-4">
                        <img src={`https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index}.jpg`} className="w-12 h-12 bg-center bg-cover border rounded-full" alt={`Testimonial ${index + 1}`} />
                        <div>
                          <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                          <p className="text-gray-500 text-md">{testimonial.occupation}</p>
                        </div>
                      </div>
                      <p className="leading-normal text-gray-300 text-md">"{testimonial.comment}"</p>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
