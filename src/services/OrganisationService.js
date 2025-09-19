import axiosInstance from '../utils/axiosInstance'

const OrganisationService = {
  addOrganization: async (organization) => {
    const res = await axiosInstance.post(`/user/api/Organizations`, organization)
    return res.data
  },

  GetOrganizationById: async () => {
    const res = await axiosInstance.get(`/user/api/Organizations`)
    return res.data
  },

  getAllOrganizations: async () => {
    const res = await axiosInstance.get(`/user/api/Organizations/All`)
    return res.data
  },

  getAllDeltedOrganizations: async () => {
    const res = await axiosInstance.get(`/user/api/Organizations/Deleted`)
    return res.data
  },

  UpdateOrganization: async (organization) => {
    const res = await axiosInstance.post(`/user/api/Organizations/update`, organization)
    return res.data
  },

  ToggleOrganizationStatus: async (id) => {
    const res = await axiosInstance.put(`/user/api/Organizations/${id}`, null)
    return res.data
  },

  UpdateUiPage: async (uiPage) => {
    const res = await axiosInstance.post(`/user/api/Organizations/update/uiPage`, uiPage)
    return res.data
  },

  RemoveBackground: async (image) => {
    const res = await axiosInstance.post(`/user/api/Organizations/remove-background`, image)
    return res.data
  },

  paymentStripe: async (data) => {
    const res = await axiosInstance.post(`/user/api/Organizations/stripe/create-checkout-session`, data)
    return res.data
  },

  paymentSquare: async (data) => {
    const res = await axiosInstance.post(`/user/api/Organizations/square/create-payment`, data)
    return res
  },

   SendEvent: async (id,type) => {
    await axiosInstance.put(`/user/api/Organizations/send_event/${id}/${type}`, null)
  },
}

export default OrganisationService
