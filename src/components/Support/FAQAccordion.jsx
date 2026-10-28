import { useState } from 'react';

const FAQAccordion = ({ sections }) => {
    const [openIds, setOpenIds] = useState([]);

    const toggleAccordion = (id) => {
        setOpenIds((prev) =>
            prev.includes(id) ? prev.filter((openId) => openId !== id) : [...prev, id]
        );
    };

    return (
        <div className="w-full" style={{ fontFamily: 'Poppins' }}>
            {sections.map((section) => (
                <div key={section.heading} className="mb-8">
                    <div className="text-xl font-bold mb-4 text-black">{section.heading}</div>
                    <div className="flex flex-col gap-4 mt-2">
                        {section.items.map((item, idx) => {
                            const isOpen = openIds.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col rounded-2xl overflow-hidden transition-all shadow-xs"
                                    style={isOpen ? { background: '#F8EAEE' } : { background: '#FAF5F8' }}
                                >
                                    <div 
                                        className="flex items-center px-6 py-5 cursor-pointer select-none"
                                        onClick={() => toggleAccordion(item.id)}
                                    >
                                        <div className="flex items-center gap-6 w-full">
                                            <div className="text-2xl sm:text-3xl font-bold text-[#9D96A8] w-12 text-center select-none">
                                                {String(idx + 1).padStart(2, '0')}
                                            </div>
                                            <div className="flex-1 text-base sm:text-lg font-medium text-black">
                                                {item.question}
                                            </div>
                                            <button
                                                className={`w-9 h-9 flex items-center justify-center rounded-full ${!isOpen ? 'bg-[#F8EAEE]' : 'bg-white'} text-xl font-bold text-gray-800 focus:outline-none transition-colors flex-shrink-0 cursor-pointer`}
                                                tabIndex={-1}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleAccordion(item.id);
                                                }}
                                                aria-label={isOpen ? 'Collapse' : 'Expand'}
                                            >
                                                {isOpen ? '−' : '+'}
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                                        style={{
                                            paddingLeft: 72,
                                            paddingRight: 24,
                                            paddingBottom: isOpen ? 20 : 0,
                                        }}
                                    >
                                        <div className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                            {item.answer}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FAQAccordion;
