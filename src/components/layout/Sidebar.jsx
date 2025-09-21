import { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Drawer,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  Typography,
} from '@mui/material'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import LocationSearchingIcon from '@mui/icons-material/LocationSearching'
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService'
import ApartmentIcon from '@mui/icons-material/Apartment'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import ReceiptIcon from '@mui/icons-material/Receipt'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import DownloadingIcon from '@mui/icons-material/Downloading'
import InventoryIcon from '@mui/icons-material/Inventory'
import AutoModeIcon from '@mui/icons-material/AutoMode'
import SosIcon from '@mui/icons-material/Sos'
import GroupIcon from '@mui/icons-material/Group'
import { useLocation, Link } from 'react-router-dom'
import authService from '../../services/authService'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/AuthContext'
import { useLanguage } from '../../hooks/LanguageContext'
import { Settings, Logout } from '@mui/icons-material'
import CustomSnackbar from '../ui/CustomSnackbar'
import { alpha, lighten } from '@mui/material/styles'
import '../../styles/layout.scss'

const Sidebar = ({
  mobileOpen,
  handleDrawerClose,
  window,
  isCollapsed=false,
  className
}) => {

  const drawerWidth = isCollapsed ? 72 : 240
  const container = window !== undefined ? () => window().document.body : undefined
  const location = useLocation()
  const { user } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { dictionary } = useLanguage()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const hasFullAcess = user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false
  const hasPerm = user?.permissions?.some((perm) => perm === 'Permissions.Devices.ManageMine') || false
  const hasPermServiceMine = user?.permissions?.some((perm) => perm === 'Permissions.Services.ManageMine') || false
  const hasPermission = (requiredPermissions = []) =>
    requiredPermissions.length === 0 ||
    requiredPermissions.some((p) => user?.permissions?.includes(p))
  const listVariants = {
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    hidden: { opacity: 0 },
  }

  const itemVariants = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -40 },
  }

  const handleLogout = async () => {
    try {
      const data = await authService.logout()
      if (data) window.location.reload()
    } catch (e) {
      setTypeSnack('error')
      setMessageSnack(e?.response?.data?.message || 'Logout failed')
      setOpenSnackBar(true)
    }
  }
  const menuItems = [
    {
      text: dictionary.dashboard,
      icon: <GridViewOutlinedIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/',
    },
    {
      text: hasFullAcess ? dictionary.Organisation : dictionary.MyOrganisation,
      icon: <ApartmentIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/organisation',
    },
    {
      text: dictionary.Users,
      icon: <GroupIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/users',
      requiredPermissions: ['Permissions.AllowAll', 'Permissions.Users.Read', 'Permissions.Users.Manage'],
    },
    {
      text: dictionary.Roles,
      icon: <SupervisedUserCircleIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/roles',
      requiredPermissions: ['Permissions.AllowAll', 'Permissions.Roles.Read', 'Permissions.Roles.Manage'],
    },
    {
      text: dictionary.OrganisationDevices,
      icon: <PrecisionManufacturingIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/devices'
    },
    {
      text: hasPerm ? dictionary.MyDevices : dictionary.CustomerDevices,
      icon: <HomeRepairServiceIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/customerDevices'
    },
    {
      text: dictionary.InstallationRequests,
      icon: <DownloadingIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/installations',
      requiredPermissions: ['Permissions.AllowAll', 'Permissions.Request.InstallationRequest'],
    },
     {
      text: dictionary.MyInstallationRequests,
      icon: <DownloadingIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/Client-installations',
      requiredPermissions: ['Permissions.Devices.ManageMine'],
    },
    {
      text: dictionary.CustomersServiceRequests,
      icon: <SosIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/serviceRequests',
      requiredPermissions: ['Permissions.AllowAll','Permissions.Services.Manage'],
    },
    {
      text: dictionary.MyServiceRequests,
      icon: <SosIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/Client-ServiceRequest',
      requiredPermissions: ['Permissions.Services.ManageMine'],
    },
     {
      text: dictionary.AiServiceRequest,
      icon: <AutoModeIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/Ai-Client-ServiceRequest',
      requiredPermissions: ['Permissions.Services.ManageMine'],
    },
     {
      text: dictionary.AiServiceRequest,
      icon: <AutoModeIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/Ai-ServiceRequest',
      requiredPermissions: ['Permissions.AllowAll', 'Permissions.Services.Manage'],
    },
    {
      text: dictionary.SpareParts,
      icon: <InventoryIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/spareParts'
    },
    {
      text: dictionary.MyOrders,
      icon: <LocalShippingIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/Client-orders',
      requiredPermissions: ['Permissions.Services.ManageMine'],
    },
    {
      text: dictionary.CustomersOrders,
      icon: <LocalShippingIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/orders',
      requiredPermissions: ['Permissions.AllowAll', 'Permissions.Services.Manage'],
    },
    {
      text: dictionary.Invoice,
      icon: <ReceiptIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/invoices',
      requiredPermissions: ['Permissions.Devices.ManageMine', 'Permissions.Services.ManageMine'],
    },
    {
      text: dictionary.Addresses,
      icon: <LocationSearchingIcon sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/address',
      requiredPermissions: [
        'Permissions.AllowAll',
        'Permissions.Addresses.ReadAll',
      ],
    },
    {
      text: dictionary.Settings,
      icon: <Settings sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      path: '/profile',
    },
    {
      text: dictionary.logout,
      icon: <Logout sx={{ color: isDark ? '#e0e0e0' : '#545555' }}/>,
      onClick: handleLogout,
    },
  ]

  const drawer = (
    <Box>
      <div className="sidebar-header" style={{height:isCollapsed? '47px':'61px'}}>
        <div className="sidebar-logo">
          <img src={user?.organization?.logoUrl} alt="Logo" className="logo" 
          style={{ width: isCollapsed ? 40 : 60, transition: '0.3s' }}
          />
        </div>
        {!isCollapsed && (
        <Typography
          variant="h6"
          sx={{
            color: isDark?'white':'#545555',
            fontWeight: 'bold',
            textAlign: 'right',
          
          }}
        >
          {user?.organization?.name}
        </Typography>
      )}
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,

            width: '2px',
          }}
        />
      </div>
      <Divider />
      <Box
      sx={{
        overflowY: 'auto',
        maxHeight: '90vh',
        scrollbarWidth: 'none', 

        '&::-webkit-scrollbar': {
          width: '6px',
          opacity: 0,
          transition: 'opacity 0.3s ease-in-out',
        },
        '&:hover::-webkit-scrollbar': {
          opacity: 1,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: isDark ? '#aaa' : '#888',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
      }}
      >
        <motion.ul
            initial="hidden"
            animate="visible"
            variants={listVariants}
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
        {menuItems.map((item) => {
          if (!hasPermission(item.requiredPermissions)) return null;

          const isActive = location.pathname === item.path;

          const primaryColor = user?.organization?.primaryColor || '#015eb9';

          const lighterBg = alpha(primaryColor, 0.15); 
          const hoverBg = isDark
            ? lighten(theme.palette.background.paper, 0.1) 
            : alpha(primaryColor, 0.08); 

          const defaultTextColor = isDark ? '#e0e0e0' : '#545555';

          return (
             <motion.li key={item.text} variants={itemVariants}>
            <ListItem
              component={Link}
              to={item.path}
              onClick={item.onClick}
              sx={{
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                px: isCollapsed ? 1 : 2,
                borderRadius: '10px',
                transition: 'background-color 0.3s ease',

                backgroundColor: isActive ? lighterBg : 'transparent',
                color: isActive ? primaryColor : defaultTextColor,

                '&:hover': {
                  backgroundColor: hoverBg,
                  borderRadius: '10px',
                },

                '& svg': {
                  color: isActive ? primaryColor : defaultTextColor,
                  transition: 'color 0.3s ease',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary={item.text} sx={{ ml: 2 }} />}
            </ListItem>
            </motion.li>
          );
        })}
      </motion.ul>
      </Box>
    </Box>
  )

  return (
    <Box >
      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: isDark
                ? "#18141c"
                : "#ffffff",
              borderColor: isDark
                ? "#18141c"
                : "#ffffff",
                overflow: 'hidden',
                transition: 'width 0.3s'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
        className={className}
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: isDark
                ? "#18141c"
                : "#ffffff",
              borderColor: isDark
                ? "#18141c"
                : "#ffffff",
                overflow: 'hidden',
                transition: 'width 0.3s',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  )
}

Sidebar.propTypes = {
    mobileOpen: PropTypes.bool.isRequired,
    handleDrawerClose: PropTypes.func.isRequired,
    window: PropTypes.func,
    isCollapsed: PropTypes.bool,
    className: PropTypes.string
  }

export default Sidebar
