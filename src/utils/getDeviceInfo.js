export const getDeviceInfo = async () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  let deviceType = 'Desktop'

  if (/android/i.test(userAgent)) {
    deviceType = 'Android'
  } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    deviceType = 'iOS'
  } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'Tablet'
  }

  const operatingSystem = (() => {
    if (userAgent.indexOf('Win') !== -1) return 'Windows'
    if (userAgent.indexOf('Mac') !== -1) return 'MacOS'
    if (userAgent.indexOf('X11') !== -1) return 'UNIX'
    if (userAgent.indexOf('Linux') !== -1) return 'Linux'
    return 'Unknown'
  })()

  const isBrave = async () => {
    return navigator.brave && typeof navigator.brave.isBrave === 'function'
      ? await navigator.brave.isBrave()
      : false
  }

  const brave = await isBrave()

  const browser = (() => {
    if (brave) return 'Brave'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('SamsungBrowser')) return 'Samsung Internet'
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera'
    if (userAgent.includes('Trident')) return 'Internet Explorer'
    if (userAgent.includes('Edg')) return 'Edge'
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Safari')) return 'Safari'
    return 'Unknown'
  })()

  return {
    deviceType,
    operatingSystem,
    browser,
  }
}
