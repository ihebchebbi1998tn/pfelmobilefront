import { useState } from 'react'
import PropTypes from 'prop-types'
import { useOutletContext } from 'react-router-dom'
import authService from '../../../services/authService'
import { useLanguage } from '../../../hooks/LanguageContext'
import {
    useTheme,
    Box, 
    Paper,
    Typography, 
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
 } from '@mui/material'
 import WarningIcon from '@mui/icons-material/Warning'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import CustomSnackbar from '../../ui/CustomSnackbar'
import CustomBadge from '../../ui/CustomBadge'

const UserConnectedDevice = ({ open, onClose, userDetail }) => {

  const { toggleLoader } = useOutletContext()
  const theme = useTheme()
  const { dictionary } = useLanguage()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const tableStyleCellHead ={fontWeight: 'bold',backgroundColor:theme.palette.mode === 'dark'? theme.palette.grey[900]: theme.palette.grey[200],color: theme.palette.text.primary}
  const RevokeUserDevice = async (id) => {
    try{
        toggleLoader(true)
        const data = await authService.revokeDevice(id)
        if(data){
            setTypeSnack('success')
            setMessageSnack(dictionary.OperationSeccesfull)
            setOpenSnackBar(true)
           onClose()
        }
    }catch(e){
        if(e?.response?.data?.message){
            const message = e?.response?.data?.message
            if(message =="User not authenticated"){
                setTypeSnack('error')
                setMessageSnack(dictionary.UserNotAuthenticated)
                setOpenSnackBar(true)
            }else if(message =="Failed to revoke device"){
                setTypeSnack('error')
                setMessageSnack(dictionary.FiledToRevokeDevice)
                setOpenSnackBar(true)
            }
        }else{
            setTypeSnack('error')
            setMessageSnack(dictionary.FiledToRevokeDevice)
            setOpenSnackBar(true)
        }
    
    }finally{
        toggleLoader(false)
    }
  }
  
  return (
    <Box>
        <CustomSnackbar
            open={openSnackBar}
            message={messageSnack}
            type={typeSnack}
            onClose={() => setOpenSnackBar(false)}
        />
         <Modal
            open={open}
            onClose={onClose}
            showConfirmButton={false}
        >
            <Box sx={{ width: { xs: '300px', sm: '400px', md: '500px', lg: '800px' } }}>
                <Typography
                    variant="h5"
                    align="center"
                    sx={{
                    fontWeight: 'bold',
                    }}
                >
                    {dictionary.UserConnectedDevices }
                </Typography>
                {(userDetail?.connectedDevices != null && userDetail?.connectedDevices.length > 0 ) ?
                 (
                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                         <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableStyleCellHead}>{dictionary.DeviceType}</TableCell>
                                    <TableCell sx={tableStyleCellHead}>{dictionary.OperatingSystem}</TableCell>
                                    <TableCell sx={tableStyleCellHead}>{dictionary.Browser}</TableCell>
                                    <TableCell sx={tableStyleCellHead}>{dictionary.Status}</TableCell>
                                    <TableCell sx={tableStyleCellHead}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userDetail?.connectedDevices.length > 0 ? (
                                    userDetail?.connectedDevices.map((row, index) => (
                                        <TableRow
                                            key={row.id || index}
                                            sx={{
                                                '&:hover': {
                                                cursor: 'pointer',
                                                backgroundColor: theme.palette.action.hover,
                                                },
                                                transition: 'background-color 0.3s ease',
                                            }}
                                        >
                                            <TableCell>{row?.deviceType}</TableCell>
                                            <TableCell>{row?.operatingSystem}</TableCell>
                                            <TableCell>{row?.browser}</TableCell>
                                            <TableCell>
                                                <CustomBadge
                                                    label={row?.isConfirmed ? dictionary.Active : dictionary.Revoked} 
                                                    type={row?.isConfirmed ? "success" : "danger"}
                                                />
                                                </TableCell>
                                            <TableCell>
                                                {row?.isConfirmed &&
                                                    <Button 
                                                        variant={'warning'}
                                                        onClick={() => RevokeUserDevice(row?.id)}
                                                    >
                                                        <>
                                                            {' '}
                                                            <WarningIcon sx={{ color: '#4b3501ff', mr:0.5,mb:0.2 }} /> {dictionary.Revoke}{' '}
                                                        </>
                                                    </Button>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    ) : (
                                    <TableRow>
                                        <TableCell
                                        colSpan={5}
                                        align="center"
                                        >
                                        <em>{dictionary.NoDataFound || 'Aucune donnée disponible.'}</em>
                                        </TableCell>
                                    </TableRow>
                                    )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                 ) : (
                     <Typography textAlign="center" sx={{ fontWeight: 'normal' }}>
                        {dictionary.NoDataFound}
                    </Typography>
                 )}
            </Box>
        </Modal>
    </Box>
  )
}

 UserConnectedDevice.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    userDetail: PropTypes.object,
 }
export default UserConnectedDevice