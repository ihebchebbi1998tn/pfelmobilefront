import axiosInstance from '../utils/axiosInstance'

const invoiceService = {
    
  getdata: async () => {
    const res = await axiosInstance.get(
      `/service/api/Invoices`
    )

    return res.data
  },
}

export default invoiceService
