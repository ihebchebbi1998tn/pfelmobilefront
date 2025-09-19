import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Box,
  Select,
  InputLabel,
  FormControl,
  InputAdornment,
  Chip,
  useTheme,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Button from '../ui/Button'
import { useLanguage } from '../../hooks/LanguageContext'
import { useAuth } from '../../hooks/AuthContext'
const TableComponent = ({
  columns,
  data,
  actions,
  onSearchChange,
  currentPage = 1,
  totalPages = 1,
  onNextPage,
  onPrevPage,
  showAddButton = false,
  addButtonLabel = '',
  onAddButtonClick,
  userPermissions = [],
  showFilter = false,
  dataFilter = [],
  showSerchInput=true
}) => {
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('')

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget)
    setSelectedRow(row)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRow(null)
  }

  const allowedActions = actions.filter(
    (action) =>
      !action.permissions ||
      action.permissions.some((p) => userPermissions.includes(p))
  )

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearchChange(searchInput.trim())
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [searchInput])
  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 3,
        p: 2,
        boxShadow: 3,
        border: '3px solid transparent',
        backgroundColor: isDark ? "#18141c" : "#ffffff",
        color: theme.palette.text.primary,
      }}
    >
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        {showSerchInput &&
 <TextField
          label={dictionary.Search || 'Search'}
          variant="outlined"
          size="small"
          fullWidth
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
               '& fieldset': {
              borderColor: user.organization.primaryColor,
            },
            '&:hover fieldset': {
              borderColor: user.organization.primaryColor,
            },
            '&.Mui-focused fieldset': {
              borderColor: user.organization.primaryColor,
            },
            },
            '& .MuiInputLabel-root': {
            color: user.organization.primaryColor,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            fontWeight: 'bold',
          },
          '& .MuiInputLabel-shrink': {
            fontWeight: 'bold',
          },
          }}
        />
        }
       
        {showAddButton && (
          <Button variant="outlined primary" onClick={onAddButtonClick} className={'stepBtnCreateUser'}>
            {addButtonLabel}
          </Button>
        )}
      </Box>
      {showFilter && (
        <Box mb={2} sx={{ minWidth: 200 }}>
          <FormControl fullWidth>
            <InputLabel>{dictionary.filterOrgName}</InputLabel>
            <Select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value)
                onSearchChange(e.target.value)
              }}
              label={dictionary.filterOrgName}
              sx={{
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: user.organization.primaryColor,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: user.organization.primaryColor,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: user.organization.primaryColor,
                  },
                  '&:hover fieldset': {
                    borderColor: user.organization.primaryColor,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: user.organization.primaryColor,
                  },
                },
              }}
            >
              <MenuItem value="">{dictionary.ClearFilter}</MenuItem>
              {dataFilter.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor:
                      isDark ? "#18141c" : theme.palette.grey[200],
                    color: theme.palette.text.primary,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              {allowedActions.length > 0 && (
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor:
                    isDark ? "#18141c" : theme.palette.grey[200],
                    color: theme.palette.text.primary,
                  }}
                >
                  {dictionary.Actions}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  sx={{
                    backgroundColor:isDark ? "#18141c" : "#ffffff",
                    '&:hover': {
                      cursor: 'pointer',
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {(() => {
                        if (col.key === 'isActive') {
                          return (
                            <Chip
                              label={
                                row[col.key]
                                  ? dictionary.Active
                                  : dictionary.Inactive
                              }
                              size="small"
                              sx={{
                                fontWeight: 'bold',
                                color: '#fff',
                                width: '90px',
                                backgroundColor: row[col.key]
                                  ? '#4caf50'
                                  : '#f44336',
                                borderRadius: '8px',
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.75rem',
                              }}
                            />
                          )
                        } else if (
                          col.key === 'permissions' &&
                          Array.isArray(row[col.key])
                        ) {
                          return row[col.key].length
                        } else {
                          return col.key.includes('.')
                            ? col.key
                                .split('.')
                                .reduce((acc, key) => acc?.[key], row)
                            : row[col.key]
                        }
                      })()}
                    </TableCell>
                  ))}
                  {allowedActions.length > 0 && (
                    <TableCell>
                      <IconButton
                        onClick={(event) => handleMenuClick(event, row)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (allowedActions.length > 0 ? 1 : 0)}
                  align="center"
                >
                  <em>
                    {dictionary.NoDataFound || 'Aucune donnée disponible.'}
                  </em>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        mt={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button variant="outlined primary" onClick={onPrevPage} dis={currentPage === 1}>
          {dictionary.prev}
        </Button>
        <span
          style={{
            fontWeight: 'bold',
          }}
        >
          {dictionary.Page || 'Page'} {currentPage} / {totalPages}
        </span>
        <Button variant="outlined primary" onClick={onNextPage} dis={currentPage >= totalPages}>
          {dictionary.Next}
        </Button>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '20px',
          },
        }}
      >
        {allowedActions.map((action) => (
          <MenuItem
            key={action.label}
            onClick={() => {
              action.onClick(selectedRow)
              handleMenuClose()
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {action.icon && (
              <Box
                component="span"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {action.icon}
              </Box>
            )}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  )
}

TableComponent.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      permissions: PropTypes.arrayOf(PropTypes.string),
      icon: PropTypes.node,
    })
  ),
  onSearchChange: PropTypes.func,
  showAddButton: PropTypes.bool,
  addButtonLabel: PropTypes.string,
  onAddButtonClick: PropTypes.func,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onNextPage: PropTypes.func,
  onPrevPage: PropTypes.func,
  userPermissions: PropTypes.arrayOf(PropTypes.string),
  showFilter: PropTypes.bool,
  dataFilter: PropTypes.arrayOf(PropTypes.string),
  showSerchInput: PropTypes.bool,
}

export default TableComponent
