const geminiService = {
    
  uploadUsers: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true, message: 'Users uploaded successfully' }
  },

   uploadDevices: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true, message: 'Devices uploaded successfully' }
  },

  uploadSpareParts: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true, message: 'Spare parts uploaded successfully' }
  },
}

export default geminiService
