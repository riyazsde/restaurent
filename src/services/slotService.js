// // Dummy Slot Service - Replace with real API when available

// class SlotService {
//   // Get all slots (dummy data)
//   async getAllSlots() {
//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 300));
      
//       return {
//         success: true,
//         count: 15,
//         data: [
//           // Morning Slots
//           {
//             slot_id: 1,
//             slots: "Morning",
//             slots_time: "07:00",
//             Status: true
//           },
//           {
//             slot_id: 2,
//             slots: "Morning",
//             slots_time: "08:00",
//             Status: true
//           },
//           {
//             slot_id: 3,
//             slots: "Morning",
//             slots_time: "09:00",
//             Status: true
//           },
//           {
//             slot_id: 4,
//             slots: "Morning",
//             slots_time: "10:00",
//             Status: true
//           },
//           {
//             slot_id: 5,
//             slots: "Morning",
//             slots_time: "11:00",
//             Status: true
//           },
//           // Lunch Slots
//           {
//             slot_id: 6,
//             slots: "Lunch",
//             slots_time: "12:00",
//             Status: true
//           },
//           {
//             slot_id: 7,
//             slots: "Lunch",
//             slots_time: "13:00",
//             Status: true
//           },
//           {
//             slot_id: 8,
//             slots: "Lunch",
//             slots_time: "14:00",
//             Status: true
//           },
//           {
//             slot_id: 9,
//             slots: "Lunch",
//             slots_time: "15:00",
//             Status: true
//           },
//           // Dinner Slots
//           {
//             slot_id: 10,
//             slots: "Dinner",
//             slots_time: "18:00",
//             Status: true
//           },
//           {
//             slot_id: 11,
//             slots: "Dinner",
//             slots_time: "19:00",
//             Status: true
//           },
//           {
//             slot_id: 12,
//             slots: "Dinner",
//             slots_time: "20:00",
//             Status: true
//           },
//           {
//             slot_id: 13,
//             slots: "Dinner",
//             slots_time: "21:00",
//             Status: true
//           },
//           {
//             slot_id: 14,
//             slots: "Dinner",
//             slots_time: "22:00",
//             Status: true
//           },
//           {
//             slot_id: 15,
//             slots: "Dinner",
//             slots_time: "23:00",
//             Status: true
//           }
//         ]
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: 'Failed to fetch slots'
//       };
//     }
//   }

//   // Error handler
//   handleError(error) {
//     if (error.response) {
//       return {
//         message: error.response.data?.message || 'An error occurred',
//         status: error.response.status,
//         data: error.response.data
//       };
//     } else if (error.request) {
//       return {
//         message: 'No response from server. Please check your connection.',
//         status: 0
//       };
//     } else {
//       return {
//         message: error.message || 'An unexpected error occurred',
//         status: 0
//       };
//     }
//   }
// }

// export default new SlotService();
