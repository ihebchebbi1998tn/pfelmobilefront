import axiosInstance from '../utils/axiosInstance'

const installationRequestService = {

  getAllInstallationRequest: async (id) => {
    const res = await axiosInstance.get(`/service/api/InstallationRequest/${id}`)
    return res.data
  },

  addInstallationRequest: async (installationRequest) => {
    const res = await axiosInstance.post(`/service/api/InstallationRequest`, installationRequest)
    return res.data
  },

  toggleInstallationRequest: async (installationRequest) => {
    const res = await axiosInstance.post(`/service/api/InstallationRequest/toggle`, installationRequest)
    return res.data
  },

  DeleteInstallationRequest: async (id) => {
    const res = await axiosInstance.delete(`/service/api/InstallationRequest/${id}`)
    return res.data
  },

  DownloadInvoiceInstallationRequest: async (id, lang, city, streetName, zipCode, phone, email) => {
  const params = new URLSearchParams({
    lang: lang || '',
    city: city || '',
    streetName: streetName || '',
    zipCode: zipCode || '',
    phone: phone || '',
    email: email || '',
  });

  const res = await axiosInstance.get(
    `/service/api/InstallationRequest/${id}/download?${params.toString()}`,
    {
      responseType: 'blob', 
    }
  )

  return res.data
 }
}

export default installationRequestService
