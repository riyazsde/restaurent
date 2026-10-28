import React,{useState} from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { FaPen, FaTrash } from 'react-icons/fa';
import cancel from '../assets/cancel.svg'
import { IoCheckmarkCircle } from 'react-icons/io5';
import { FaTimes } from 'react-icons/fa';

const CustomerDetails = () => {
     const { t } = useTranslation('customer');
     const [showUpdate, setShowUpdate] = useState(false);
        const [isModalOpen, setIsModalOpen] = useState(false);
            const [showCancel2, setCancel2] = useState(false);
        
               const navigate = useNavigate();
        
    return (
        <>
            <div style={{fontFamily:'Poppins'}} className='p-6'>
                <div className="text-gray-500 text-[32px] font-semibold">
                    <Link to="/dashboard/customers" className="">
                        {t('title')}
                    </Link>
                    <span className="text-black font-bold">{' > '}{t('detailsTitle')}</span>
                </div>
            
            <div className="pt-12 font-[Poppins] max-w-3xl">
                {/* Top Row - Profile */}
                <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <img
                            src="https://randomuser.me/api/portraits/men/32.jpg" // replace with actual image
                            alt="profile"
                            className="w-14 h-14 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-lg font-semibold">Fahim</h2>
                            <p className="text-sm text-gray-700">+27 98765432</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button style={{background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)'
}} className="w-9 h-9 rounded-full flex items-center justify-center">
                            <FaPen  onClick={() => setIsModalOpen(true)} className="text-gray-700 text-sm" />
                        </button>
                         {isModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                  <div className="bg-white w-[90%] sm:w-[450px] p-6 rounded-xl relative shadow-xl">
                                    {/* Close Button */}
                                    <button
                                      className="absolute top-4 right-4 text-black"
                                      onClick={() => setIsModalOpen(false)}
                                    >
                                      <FaTimes />
                                    </button>
                        
                                    {/* Modal Title */}
                                    <h2 className="text-xl font-bold mb-6">{t('form.updateTitle')}</h2>
                        
                                    {/* Phone */}
                                    <label className="block text-sm mb-1">{t('form.phone')}</label>
                                    <input
                                      type="text"
                                      placeholder={t('form.placeholders.phone')}
                                      className="w-full px-3 py-2 rounded-md text-sm border border-purple-300 mb-4 outline-none"
                                    />
                        
                                    {/* Name */}
                                    <label className="block text-sm mb-1">{t('form.name')}</label>
                                    <input
                                      type="text"
                                      placeholder={t('form.placeholders.name')}
                                      className="w-full px-3 py-2 rounded-md text-sm border border-purple-300 mb-4 outline-none"
                                    />
                        
                                    <div className="flex gap-4 mb-4">
                                      <div className="w-1/2">
                                        <label className="block text-sm mb-1">{t('form.dob')}</label>
                                        <input style={{background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)'
                        }}
                                          type="date"
                                          className="w-full px-3 py-2 rounded-md text-sm border border-red-300 outline-none"
                                        />
                                      </div>
                                      <div className="w-1/2">
                                        <label className="block text-sm mb-1">{t('form.table')}</label>
                                        <select style={{background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)'
                        }} className="w-full px-3 py-2 rounded-md text-sm border border-red-300 outline-none">
                                          <option>{t('form.options.select')}</option>
                                          <option>Table 1</option>
                                          <option>Table 2</option>
                                        </select>
                                      </div>
                                    </div>
                        
                                    {/* Email */}
                                    <label className="block text-sm mb-1">{t('form.email')}</label>
                                    <input
                                      type="email"
                                      placeholder={t('form.placeholders.email')}
                                      className="w-full px-3 py-2 rounded-md text-sm border border-purple-300 mb-4 outline-none"
                                    />
                        
                                    {/* Notes */}
                                    <label className="block text-sm mb-1">{t('form.notes')}</label>
                                    <textarea
                                      placeholder={t('form.placeholders.notes')}
                                      rows="3"
                                      className="w-full px-3 py-2 rounded-md text-sm border border-purple-300 mb-4 outline-none"
                                    ></textarea>
                        
                                    {/* Save Button */}
                                    <button  onClick={() => {
                          setShowUpdate(true);
                          setIsModalOpen(false);
                        }}
                        
                                      className="w-full py-2 rounded-md text-white font-medium text-sm"
                                      style={{
                                        background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                                      }}
                                    >
                                      {t('form.save')}
                                    </button>
                                  </div>
                                </div>
                              )}
                        
                              {showUpdate && (
                                                              <>
                                                                  <div
                                                                      className="fixed inset-0 bg-black bg-opacity-40 z-40"
                                                                      onClick={() => setShowUpdate(false)}
                                                                  />
                                                                  <div style={{ fontFamily: 'Poppins' }} className="fixed z-50 inset-0 flex items-center justify-center px-4">
                                                                      <div className="bg-white max-w-md w-full p-6 rounded-2xl text-center shadow-lg">
                                                                          <div className="flex justify-center mb-4">
                                                                              <IoCheckmarkCircle className="text-[#34C759] text-6xl" />
                                                                          </div>
                                                                          <h3 className="text-[24px] pt-2 font-bold text-[#34C759] mb-2">
                                                                              {t('success.updatedTitle')}
                                                                          </h3>
                                                                          <p className="text-[16px] pt-3 font-bold text-black mb-6">
                                                                              {t('success.detailsUpdatedMessage')}
                                                                          </p>
                                                                          <button
                                                                              className="bg-[#34C759] text-white px-8 py-3 mt-4 rounded-md"
                                                                              // onClick={() => setShowSuccessModal(false)}
                                                                              onClick={() => {
                                                                                  navigate('/dashboard/customers')
                              
                                                                              }}
                                                                          >
                                                                              {t('delete.continue')}
                                                                          </button>
                                                                      </div>
                                                                  </div>
                                                              </>
                                                          )}
                        <button style={{background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)'}} className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200">
                            <FaTrash onClick={() => setCancel2(true)} className="text-red-500 text-sm" />
                        </button>
                        {showCancel2 && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                                    onClick={() => setCancel2(false)}
                                />
                                <div style={{ fontFamily: 'Poppins' }} className="fixed z-50 inset-0 flex items-center justify-center px-4">
                                    <div className="bg-white max-w-md w-full p-6 rounded-2xl text-center shadow-lg">
                                        <div className="flex justify-center mb-4">
                                            <img src={cancel} alt='cancel' />
                                        </div>
                                        <h3 className="text-[24px] pt-2 font-bold text-[#C51800] mb-2">
                                            {t('delete.deletedTitle')}
                                        </h3>
                                        <p className="text-[24px] pt-3 font-bold text-black mb-6">
                                            {t('delete.warning')}
                                        </p>
                                        <button
                                            className="bg-[#C51800] text-white px-8 py-3 mt-4 rounded-md"
                                            // onClick={() => setShowSuccessModal(false)}

                                       onClick={() => {
                                                                                  navigate('/dashboard/customers')
                              
                                                                              }}


                                        >
                                            {t('delete.continue')}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('details.gender')}</label>
                        <input
                            type="text"
                            value="ACHIBears@gmail.com"
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm outline-none"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('details.dob')}</label>
                        <input
                            type="text"
                            value="ACHI BARS"
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm outline-none"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('details.visited')}</label>
                        <input
                            type="text"
                            value="98"
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm outline-none"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('details.loyaltyPoints')}</label>
                        <input
                            type="text"
                            value="30"
                            readOnly
                            className="w-full px-3 py-2 rounded-md text-sm text-white font-semibold outline-none"
                            style={{
                               background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)'

                            }}
                        />
                    </div>
                </div>
            </div>
            </div>
        </>
    )
}

export default CustomerDetails