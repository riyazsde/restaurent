/* eslint-disable no-unused-vars */
// import React, { useState } from "react";
// import bgImage from "../assets/Gradient.svg"; // Your background image path
// import logo from "../assets/logo.svg"
// import { Eye, EyeOff } from 'lucide-react'; // You can also use FontAwesome or plain SVG
// import { useNavigate } from "react-router-dom";

// const RegisterPage = () => {
//     const [selectedTab, setSelectedTab] = useState('Restaurant');
//     const [showPassword, setShowPassword] = useState(false);
//     const tabs = ['Restaurant', 'Employee', 'Admin'];
//     const navigate = useNavigate();
//     return (
//         <div className="flex h-screen overflow-hidden font-sans">
//             {/* Left Side */}
//             <div
//                 className="w-1/2 bg-cover bg-center relative hidden md:block"
//                 style={{
//                     backgroundImage: `url(${bgImage})`,
//                 }}
//             >
//                 <div className="absolute inset-0 bg-black/20 flex flex-col justify-center text-white px-10 text-start">
//                     {/* <h1 style={{fontFamily:'Poppins',fontWeight:'bold'}} className="text-3xl text-[#002B6B] md:text-[42px] leading-[1.2] mb-4">
//                         POS that works as hard as you.
//                         and Faster than you.
//                     </h1> */}
//                     <h1 className="text-3xl md:text-[35px] font-bold text-[#002B6B] leading-[1.2] mb-4 font-[Poppins]">
//                         POS that works as hard as you.
//                         and Faster than you.
//                     </h1>

//                     <p style={{ fontFamily: 'Poppins' }} className="text-sm text-[#414D60] md:text-[18px]">
//                         Grow without limit with Triaxx and make timely and accurate
//                         decisions with real-time reports.
//                     </p>

//                     {/* Language Dropdown */}
//                     {/* <div className="absolute bottom-10 left-10">
//                         <select className="bg-white text-black px-3 py-1 rounded-md text-sm">
//                             <option>English</option>
//                             <option>Hindi</option>
//                             <option>French</option>
//                         </select>
//                     </div> */}
//                     <div style={{ fontFamily: 'Poppins' }} className="absolute bottom-24 rounded-lg left-10">
//                         <div
//                             className="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-md border"
//                             style={{
//                                 borderImage: 'linear-gradient(90deg, #6A1B9A, #D32F2F) 1',
//                                 borderWidth: '1px',
//                                 borderStyle: 'solid',
//                             }}
//                         >
//                             <span className="flex items-center gap-2 text-sm font-medium text-black">
//                                 English
//                                 <img
//                                     src="https://flagcdn.com/w40/my.png" // Malaysian flag
//                                     alt="Malaysia Flag"
//                                     className="w-5 h-4 object-cover"
//                                 />
//                             </span>

//                             {/* Dropdown arrow */}
//                             <svg
//                                 className="w-4 h-4 ml-2 text-black"
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                                 stroke="currentColor"
//                             >
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                         </div>
//                     </div>

//                 </div>
//             </div>

//             {/* Right Side */}
//             <div style={{ fontFamily: 'Poppins' }} className="w-full md:w-1/2 overflow-y-auto  flex items-center justify-center">
//                 <div className="max-w-md w-full p-8 space-y-6 ">
//                     {/* <img src={logo} className="text-2xl font-bold text-right text-[#8A1538]"></img>
//           <h3 className="text-2xl font-semibold">Register</h3> */}
//                     <div className="flex justify-between items-center mb-6">
//                         <h3 className="text-[24px] font-semibold">Sign in</h3>
//                         <div className="flex items-center space-x-2">
//                             <img src={logo} alt="Triaxx Logo" className="" />
//                         </div>
//                     </div>

//                     <div className=" mt-8 ">
//                         <h2 className="text-[32px] font-bold text-center mb-1">Forget Password</h2>
//                         <p className="text-center text-[16px] text-[#00000099] mb-4">
//                             An Authentication code has sent to your email <span className="text-[#000000] text-[18px]">ADMIN123@gmail.com</span>
//                         </p>

                

                        
//                     </div>

//                     <button  onClick={() => navigate('/verifyotp')}  style={{
//                         background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)"
//                     }}
//                         type="submit"
//                         className="w-full  text-white text-[18px] p-3 rounded-xl"
//                     >
//                      Verify OTP
//                     </button>

//                     <button  onClick={() => navigate(-1)}
//   type="submit"
//   className="w-full text-[18px] p-[2px] rounded-xl"
//   style={{
//     background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)"
//   }}
// >
//   <div
//     className="w-full h-full text-black p-3 rounded-xl text-center"
//     style={{
//       backgroundColor: "#fff" // or use `transparent` or your desired fill color
//     }}
//   >
//     Back
//   </div>
// </button>



                   

//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RegisterPage;
import React, { useState, useEffect } from "react";
import bgImage from "../assets/Gradient.svg"; // Your background image path
import logo from "../assets/logo.svg";
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [selectedTab, setSelectedTab] = useState('Restaurant');
    const [showPassword, setShowPassword] = useState(false);
    const tabs = ['Restaurant', 'Employee', 'Admin'];
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Adjust 768 based on your md breakpoint

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden font-sans">
            {/* Background image for mobile */}
            <div
                className="absolute inset-0 bg-cover bg-center md:hidden"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white px-4 text-center">
                    <div>
                        <h1 className="text-xl font-bold text-[#002B6B] leading-[1.2] mb-2 font-[Poppins]">
                            POS that works as hard as you. and Faster than you.
                        </h1>
                        <p className="text-xs text-[#414D60] font-[Poppins]">
                            Grow without limit with Triaxx and make timely and accurate decisions with real-time reports.
                        </p>
                    </div>
                </div>
            </div>

            {/* Left Side (Desktop only) */}
            <div
                className="w-1/2 bg-cover bg-center relative hidden md:block"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/20 flex flex-col justify-center text-white px-10 text-start">
                    <h1 className="text-3xl md:text-[35px] font-bold text-[#002B6B] leading-[1.2] mb-4 font-[Poppins]">
                        POS that works as hard as you. and Faster than you.
                    </h1>
                    <p style={{ fontFamily: 'Poppins' }} className="text-sm text-[#414D60] md:text-[18px]">
                        Grow without limit with Triaxx and make timely and accurate decisions with real-time reports.
                    </p>
                    <div style={{ fontFamily: 'Poppins' }} className="absolute bottom-24 rounded-lg left-10">
                        <div
                            className="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-md border"
                            style={{
                                borderImage: 'linear-gradient(90deg, #6A1B9A, #D32F2F) 1',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                            }}
                        >
                            <span className="flex items-center gap-2 text-sm font-medium text-black">
                                English
                                <img
                                    src="https://flagcdn.com/w40/my.png"
                                    alt="Malaysia Flag"
                                    className="w-5 h-4 object-cover"
                                />
                            </span>
                            <svg
                                className="w-4 h-4 ml-2 text-black"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div style={{ fontFamily: 'Poppins' }} className="w-full md:w-1/2 overflow-y-auto flex items-center justify-center relative z-10">
                <div className="max-w-md w-full p-4 md:p-8 space-y-4 md:space-y-6 mt-8 bg-white mx-4 rounded-xl">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h3 className="text-[20px] md:text-[24px] font-semibold">Sign in</h3>
                        <div className="flex items-center space-x-2">
                            <img src={logo} alt="Triaxx Logo" className="" />
                        </div>
                    </div>

                    <div className="mt-4 md:mt-8 text-center">
                        <h2 className="text-[24px] md:text-[32px] font-bold mb-1">Forget Password</h2>
                        <p className="text-[14px] md:text-[16px] text-[#00000099] mb-2 md:mb-4">
                            An Authentication code has sent to your email{" "}
                            <span className="text-[#000000] text-[16px] md:text-[18px]">ADMIN123@gmail.com</span>
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/verifyotp')}
                        style={{ background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)" }}
                        type="submit"
                        className="w-full text-white text-[16px] md:text-[18px] p-2 md:p-3 rounded-xl"
                    >
                        Verify OTP
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        type="submit"
                        className="w-full text-[16px] md:text-[18px] p-[2px] md:p-[2px] rounded-xl"
                        style={{ background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)" }}
                    >
                        <div
                            className="w-full h-full text-black p-3 rounded-xl text-center"
                            style={{ backgroundColor: "#fff" }}
                        >
                            Back
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;