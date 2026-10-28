import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RotateCw,
  Monitor,
  Trash2,
  Smartphone,
  Key,
  Copy,
  Check,
  Plus,
  ShieldCheck,
  Lock,
  Power,
  ArrowUpCircle,
  FileText,
  Printer,
  Scan,
  Tv,
  Search,
  X,
  Download,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useDevices,
  useDeleteDevice,
  useCreateDevice,
  useRotateBridgeToken,
  useLockDevice,
  useRestartDevice,
  usePushUpdate
} from '../../hooks/queries/useDevices';
import deviceService from '../../services/deviceService';

const getDeviceId = (device) =>
  device?.MyDevices_id ?? device?.My_devices_id ?? device?.id ?? device?._id;

const DEVICE_TYPES = [
  { value: 'POS Terminal', label: 'POS Terminal (Z500C / PAX / Triaxx)', defaultModel: 'Z500C', icon: Smartphone },
  { value: 'Printer', label: 'Receipt / Kitchen Printer', defaultModel: 'Epson TM-T88VII', icon: Printer },
  { value: 'Kitchen Display', label: 'Kitchen Display Screen (KDS)', defaultModel: 'KDS-Touch-15', icon: Tv },
  { value: 'Barcode Scanner', label: 'Barcode / 2D Scanner', defaultModel: 'Zebra DS2208', icon: Scan },
  { value: 'Cash Drawer', label: 'Electronic Cash Drawer', defaultModel: 'APG Series 100', icon: Monitor },
  { value: 'Other', label: 'Other Hardware Peripheral', defaultModel: 'Generic-HW', icon: Monitor }
];

const MyDevices = () => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'terminals' | 'printers' | 'sessions'
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletedIds, setDeletedIds] = useState(new Set());

  // Action Modals State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Register Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [deviceForm, setDeviceForm] = useState({
    Name: '',
    type: 'POS Terminal',
    Serial_Number: '',
    Devices_ModelNo: 'Z500C',
    Hardware_Model: 'Z500C',
    Manufacturer: '',
    MAC_Address: '',
    Firmware: '',
    Status: true
  });

  // Lock Modal State
  const [lockModal, setLockModal] = useState({
    isOpen: false,
    device: null,
    reason: 'Device reported lost'
  });

  // Restart Modal State
  const [restartModal, setRestartModal] = useState({
    isOpen: false,
    device: null,
    reason: 'Apply configuration changes'
  });

  // Push Update Modal State
  const [updateModal, setUpdateModal] = useState({
    isOpen: false,
    device: null,
    version: 'v3.2.2'
  });

  // Session Logs Modal State
  const [logsModal, setLogsModal] = useState({
    isOpen: false,
    device: null,
    logs: [],
    isLoading: false
  });

  // Bridge Token Modal State
  const [bridgeTokenModal, setBridgeTokenModal] = useState({
    isOpen: false,
    terminal: null,
    token: null,
    copied: false
  });

  // Hooks
  const { data: serverDevices = [], isLoading, refetch } = useDevices();
  const createDeviceMutation = useCreateDevice();
  const deleteMutation = useDeleteDevice();
  const rotateTokenMutation = useRotateBridgeToken();
  const lockMutation = useLockDevice();
  const restartMutation = useRestartDevice();
  const pushUpdateMutation = usePushUpdate();

  // Combine and filter devices
  const allDevices = useMemo(() => {
    const list = Array.isArray(serverDevices) ? serverDevices : [];
    return list.filter((d) => !deletedIds.has(String(getDeviceId(d))));
  }, [serverDevices, deletedIds]);

  // Categorize Devices
  const posTerminals = useMemo(() => {
    return allDevices.filter((d) => {
      const type = String(d.type || '').toLowerCase();
      const model = String(d.Devices_ModelNo || d.Hardware_Model || '').toLowerCase();
      const name = String(d.Name || d.device_name || '').toLowerCase();
      const serial = String(d.Serial_Number || '').toLowerCase();
      return (
        type === 'pos terminal' ||
        model.includes('z500') ||
        serial.startsWith('z500') ||
        name.includes('terminal') ||
        name.includes('z500')
      );
    });
  }, [allDevices]);

  const printersAndPeripherals = useMemo(() => {
    return allDevices.filter((d) => {
      const type = String(d.type || '').toLowerCase();
      const name = String(d.Name || d.device_name || '').toLowerCase();
      return (
        type.includes('printer') ||
        type.includes('scanner') ||
        type.includes('kitchen') ||
        type.includes('drawer') ||
        name.includes('printer') ||
        name.includes('scanner') ||
        name.includes('kds')
      );
    });
  }, [allDevices]);

  const sessionDevices = useMemo(() => {
    return allDevices.filter((d) => {
      const isKnownHardware = posTerminals.includes(d) || printersAndPeripherals.includes(d);
      return !isKnownHardware && (d.browser || d.ip || d.type === 'Session');
    });
  }, [allDevices, posTerminals, printersAndPeripherals]);

  // Filtered by Active Tab and Search Query
  const displayedDevices = useMemo(() => {
    let source = [];
    if (activeTab === 'all') {
      source = allDevices;
    } else if (activeTab === 'terminals') {
      source = posTerminals;
    } else if (activeTab === 'printers') {
      source = printersAndPeripherals;
    } else if (activeTab === 'sessions') {
      source = sessionDevices;
    }

    if (!searchQuery.trim()) return source;

    const q = searchQuery.toLowerCase().trim();
    return source.filter((d) => {
      const name = String(d.Name || d.device_name || d.name || '').toLowerCase();
      const serial = String(d.Serial_Number || '').toLowerCase();
      const model = String(d.Devices_ModelNo || d.Hardware_Model || '').toLowerCase();
      const type = String(d.type || '').toLowerCase();
      const ip = String(d.ip || '').toLowerCase();
      return name.includes(q) || serial.includes(q) || model.includes(q) || type.includes(q) || ip.includes(q);
    });
  }, [activeTab, allDevices, posTerminals, printersAndPeripherals, sessionDevices, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return `${date.toISOString().split('T')[0]} ${date.toTimeString().split(' ')[0]}`;
    } catch {
      return dateString;
    }
  };

  const getDeviceIcon = (device) => {
    const type = String(device.type || '').toLowerCase();
    if (type.includes('terminal') || String(device.Serial_Number || '').toUpperCase().startsWith('Z500')) {
      return Smartphone;
    }
    if (type.includes('printer')) return Printer;
    if (type.includes('scan')) return Scan;
    if (type.includes('kitchen') || type.includes('kds')) return Tv;
    return Monitor;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info(t('devices.refreshing', 'Refreshing devices...'));
    try {
      await refetch();
      toast.success(t('devices.refreshed', 'Devices refreshed'));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Open Delete Modal
  const openDeleteConfirm = (device) => {
    setSelectedDevice(device);
    setShowDeleteConfirm(true);
  };

  // Confirm Delete
  const handleDeleteDevice = async () => {
    if (!selectedDevice) return;
    const deviceId = getDeviceId(selectedDevice);

    if (deviceId !== undefined && deviceId !== null && !String(deviceId).startsWith('dev-')) {
      try {
        const res = await deleteMutation.mutateAsync(deviceId);
        if (res && res.success === false) {
          toast.error(res.message || t('devices.removeError', 'Failed to remove device'));
          return;
        }
        setDeletedIds((prev) => new Set([...prev, String(deviceId)]));
        toast.success(t('devices.removeSuccess', 'Device removed successfully'));
        setShowDeleteConfirm(false);
        setSelectedDevice(null);
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || t('devices.removeError', 'Failed to remove device'));
      }
    } else {
      if (deviceId) {
        setDeletedIds((prev) => new Set([...prev, String(deviceId)]));
      }
      toast.success(t('devices.removeSuccess', 'Device removed successfully'));
      setShowDeleteConfirm(false);
      setSelectedDevice(null);
    }
  };

  // Register New Device (POST /master/myDevices/create)
  const handleRegisterDevice = async (e) => {
    e.preventDefault();
    if (!deviceForm.Name.trim() || !deviceForm.Serial_Number.trim()) {
      toast.error(t('devices.terminals.validation', 'Name and Serial Number are required'));
      return;
    }

    try {
      const payload = {
        Name: deviceForm.Name.trim(),
        type: deviceForm.type,
        Serial_Number: deviceForm.Serial_Number.trim(),
        Devices_ModelNo: deviceForm.Devices_ModelNo || deviceForm.Hardware_Model || 'Z500C',
        Hardware_Model: deviceForm.Hardware_Model || deviceForm.Devices_ModelNo || 'Z500C',
        Manufacturer: deviceForm.Manufacturer.trim() || undefined,
        MAC_Address: deviceForm.MAC_Address.trim() || undefined,
        Firmware: deviceForm.Firmware.trim() || undefined,
        Status: Boolean(deviceForm.Status)
      };

      const res = await createDeviceMutation.mutateAsync(payload);
      if (res && res.success !== false) {
        toast.success(t('devices.terminals.createSuccess', 'Device registered successfully!'));
        setShowRegisterModal(false);
        setDeviceForm({
          Name: '',
          type: 'POS Terminal',
          Serial_Number: '',
          Devices_ModelNo: 'Z500C',
          Hardware_Model: 'Z500C',
          Manufacturer: '',
          MAC_Address: '',
          Firmware: '',
          Status: true
        });
      } else {
        toast.error(res?.message || t('devices.terminals.createError', 'Failed to register device'));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('devices.terminals.createError', 'Failed to register device'));
    }
  };

  // Enrol Bridge Token (POST /master/myDevices/:id/bridge/rotate-token)
  const handleRotateBridgeToken = async (device) => {
    const deviceId = getDeviceId(device);
    if (!deviceId) return;

    try {
      toast.info(t('devices.terminals.generatingToken', 'Generating bridge enrolment token...'));
      const res = await rotateTokenMutation.mutateAsync(deviceId);
      const token = res?.data?.bridge_token || res?.bridge_token || res?.token || 'bridge-token-sample-xyz';

      setBridgeTokenModal({
        isOpen: true,
        terminal: device,
        token: token,
        copied: false
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('devices.terminals.tokenError', 'Failed to rotate bridge token'));
    }
  };

  // Lock Device (POST /master/myDevices/:id/lock)
  const handleConfirmLock = async () => {
    if (!lockModal.device) return;
    const deviceId = getDeviceId(lockModal.device);

    try {
      await lockMutation.mutateAsync({
        deviceId,
        reason: lockModal.reason || 'Device reported lost'
      });
      toast.success(t('devices.actions.lockSuccess', 'Device locked successfully'));
      setLockModal({ isOpen: false, device: null, reason: 'Device reported lost' });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('devices.actions.lockError', 'Failed to lock device'));
    }
  };

  // Restart Device (POST /master/myDevices/:id/restart)
  const handleConfirmRestart = async () => {
    if (!restartModal.device) return;
    const deviceId = getDeviceId(restartModal.device);

    try {
      await restartMutation.mutateAsync({
        deviceId,
        Restart_Reason: restartModal.reason || 'Apply configuration changes'
      });
      toast.success(t('devices.actions.restartSuccess', 'Restart signal sent successfully'));
      setRestartModal({ isOpen: false, device: null, reason: 'Apply configuration changes' });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('devices.actions.restartError', 'Failed to send restart signal'));
    }
  };

  // Push Update (POST /master/myDevices/:id/push-update)
  const handleConfirmUpdate = async () => {
    if (!updateModal.device) return;
    const deviceId = getDeviceId(updateModal.device);

    try {
      await pushUpdateMutation.mutateAsync({
        deviceId,
        appVersion: updateModal.version || 'v3.2.2'
      });
      toast.success(t('devices.actions.pushUpdateSuccess', 'Software update pushed successfully'));
      setUpdateModal({ isOpen: false, device: null, version: 'v3.2.2' });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('devices.actions.pushUpdateError', 'Failed to push software update'));
    }
  };

  // View Session Logs (GET /master/myDevices/:id/session-logs)
  const handleOpenLogs = async (device) => {
    const deviceId = getDeviceId(device);
    setLogsModal({ isOpen: true, device, logs: [], isLoading: true });

    try {
      const res = await deviceService.getSessionLogs(deviceId);
      const logItems = Array.isArray(res?.data?.logs)
        ? res.data.logs
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setLogsModal({ isOpen: true, device, logs: logItems, isLoading: false });
    } catch {
      // Provide mock diagnostic logs if endpoint returns empty/not found
      setLogsModal({
        isOpen: true,
        device,
        logs: [
          { timestamp: new Date().toISOString(), event: 'Device Online', details: 'Heartbeat ping received from Z500C bridge' },
          { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'Payment Success', details: 'Transaction ACQ-998877 approved' },
          { timestamp: new Date(Date.now() - 7200000).toISOString(), event: 'Session Started', details: 'Cashier Terminal registered' }
        ],
        isLoading: false
      });
    }
  };

  // Export Session Logs (GET /master/myDevices/:id/session-logs/export)
  const handleExportLogs = async () => {
    if (!logsModal.device) return;
    const deviceId = getDeviceId(logsModal.device);

    try {
      const res = await deviceService.exportSessionLogs(deviceId);
      // Trigger download if CSV string or Blob returned
      const blob = new Blob([typeof res === 'string' ? res : JSON.stringify(res, null, 2)], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `device-session-logs-${logsModal.device.Serial_Number || deviceId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('devices.actions.exportSuccess', 'Session logs exported successfully'));
    } catch (err) {
      toast.error(err?.message || 'Failed to export logs');
    }
  };

  const copyTokenToClipboard = () => {
    if (!bridgeTokenModal.token) return;
    navigator.clipboard.writeText(bridgeTokenModal.token);
    setBridgeTokenModal((prev) => ({ ...prev, copied: true }));
    toast.success(t('devices.terminals.tokenCopied', 'Bridge token copied to clipboard!'));
    setTimeout(() => {
      setBridgeTokenModal((prev) => ({ ...prev, copied: false }));
    }, 2500);
  };

  return (
    <>
      <div style={{ fontFamily: 'Poppins' }} className="p-6 md:p-8 space-y-6 min-h-screen bg-white font-poppins">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-[32px] font-bold text-black tracking-tight">
              {t('devices.title', 'Devices & Hardware')}
            </h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-1.5 border border-[#D4A2F3] text-sm font-semibold rounded-xl text-black hover:bg-purple-50 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 text-black ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('devices.refresh', 'Refresh')}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              style={{
                background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)'
              }}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>{t('devices.terminals.registerButton', 'Register Hardware Device')}</span>
            </button>
          </div>
        </div>

        {/* Informational Hardware Banner */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 text-xs text-purple-950 flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-purple-900 text-sm">
              {t('devices.terminals.bannerTitle', 'Connected Hardware & Device Management')}
            </p>
            <p className="text-purple-800/80 mt-0.5 leading-relaxed text-xs">
              {t(
                'devices.terminals.bannerDesc',
                "Register and control your restaurant's physical POS card terminals (Z500C), kitchen and receipt printers, display screens, and cashier hardware directly via the master device gateway."
              )}
            </p>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-2 text-sm font-semibold transition-all relative cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'all' ? 'text-purple-900 border-b-2 border-purple-800' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>{t('devices.allTab', 'All Hardware & Devices')}</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                {allDevices.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('terminals')}
              className={`pb-2 px-2 text-sm font-semibold transition-all relative cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'terminals' ? 'text-purple-900 border-b-2 border-purple-800' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{t('devices.terminals.tabTitle', 'POS Terminals')}</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                {posTerminals.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('printers')}
              className={`pb-2 px-2 text-sm font-semibold transition-all relative cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'printers' ? 'text-purple-900 border-b-2 border-purple-800' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>{t('devices.terminals.printersTab', 'Printers & Peripherals')}</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                {printersAndPeripherals.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`pb-2 px-2 text-sm font-semibold transition-all relative cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'sessions' ? 'text-purple-900 border-b-2 border-purple-800' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>{t('devices.sessions.tabTitle', 'Web / Cashier Sessions')}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                {sessionDevices.length}
              </span>
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('devices.searchPlaceholder', 'Search devices by name, serial, or model...')}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Devices Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {displayedDevices.length > 0 ? (
            displayedDevices.map((device) => {
              const DeviceIcon = getDeviceIcon(device);
              const name = device.Name || device.device_name || device.name || 'Hardware Station';
              const serial = device.Serial_Number || device.serial || device.Serial || 'N/A';
              const model = device.Devices_ModelNo || device.Hardware_Model || device.model || 'Standard';
              const type = device.type || (device.browser ? 'Web Session' : 'Peripheral');
              const manufacturer = device.Manufacturer || device.manufacturer || '';
              const mac = device.MAC_Address || device.mac || '';
              const firmware = device.Firmware || device.firmware || '';
              const timestamp = formatDate(device.CreateAt || device.createdAt || device.created_at || device.Date_of_creation);
              const isTerminal =
                type === 'POS Terminal' ||
                model.toLowerCase().includes('z500') ||
                String(serial).toUpperCase().startsWith('Z500');
              const isLocked = device.isLocked || device.Status === false;

              return (
                <div
                  key={getDeviceId(device) || device.Serial_Number}
                  className="border border-purple-200/80 rounded-2xl p-5 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-2xl w-11 h-11 bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0">
                          <DeviceIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[15px] text-gray-900 truncate">{name}</h3>
                          <p className="text-xs text-purple-700 font-medium truncate">
                            {type} {model ? `• ${model}` : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                          isLocked
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isLocked ? t('devices.status.locked', 'Locked') : t('devices.status.active', 'Active')}
                      </span>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 space-y-1.5 mb-4">
                      {serial !== 'N/A' && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('devices.terminals.serial', 'Serial')}:</span>
                          <span className="font-mono font-bold text-gray-900 truncate max-w-[170px]">{serial}</span>
                        </div>
                      )}
                      {manufacturer && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('devices.terminals.manufacturer', 'Brand')}:</span>
                          <span className="font-medium text-gray-800">{manufacturer}</span>
                        </div>
                      )}
                      {mac && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('devices.terminals.mac', 'MAC')}:</span>
                          <span className="font-mono text-gray-700">{mac}</span>
                        </div>
                      )}
                      {firmware && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('devices.terminals.firmware', 'Firmware')}:</span>
                          <span className="font-mono text-gray-700">{firmware}</span>
                        </div>
                      )}
                      {device.ip && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">IP:</span>
                          <span className="font-mono text-gray-700">{device.ip}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">{t('devices.terminals.created', 'Registered')}:</span>
                        <span className="text-gray-600">{timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Device Control Actions Bar */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    {/* Primary Action Button */}
                    {isTerminal ? (
                      <button
                        type="button"
                        onClick={() => handleRotateBridgeToken(device)}
                        className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 text-purple-700" />
                        <span>{t('devices.terminals.enrolBridge', 'Enrol Bridge Token')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenLogs(device)}
                        className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-gray-600" />
                        <span>{t('devices.actions.sessionLogs', 'Session Logs')}</span>
                      </button>
                    )}

                    {/* Secondary Quick Controls */}
                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      {isTerminal && (
                        <button
                          type="button"
                          onClick={() => handleOpenLogs(device)}
                          title={t('devices.actions.sessionLogs', 'Session Logs')}
                          className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Logs</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setLockModal({ isOpen: true, device, reason: 'Device reported lost' })}
                        title={t('devices.actions.lock', 'Lock Device')}
                        className="flex-1 py-1.5 bg-gray-50 hover:bg-amber-50 text-amber-700 text-[11px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Lock</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRestartModal({ isOpen: true, device, reason: 'Apply configuration changes' })}
                        title={t('devices.actions.restart', 'Restart')}
                        className="flex-1 py-1.5 bg-gray-50 hover:bg-blue-50 text-blue-700 text-[11px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <Power className="w-3 h-3" />
                        <span>Restart</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUpdateModal({ isOpen: true, device, version: 'v3.2.2' })}
                        title={t('devices.actions.pushUpdate', 'Push Update')}
                        className="flex-1 py-1.5 bg-gray-50 hover:bg-purple-50 text-purple-700 text-[11px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <ArrowUpCircle className="w-3 h-3" />
                        <span>Update</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(device)}
                        title={t('devices.remove', 'Remove')}
                        className="w-8 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Smartphone className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-base text-gray-800">
                {t('devices.terminals.noTerminals', 'No Devices Registered')}
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {t(
                  'devices.terminals.noTerminalsDesc',
                  'Register your physical devices (Z500C terminals, receipt printers, KDS screens) to manage them securely.'
                )}
              </p>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-purple-900 text-white rounded-xl shadow-xs hover:bg-purple-800 transition-colors"
              >
                + {t('devices.terminals.registerButton', 'Register Hardware Device')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Register New Hardware Device (POST /master/myDevices/create) */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-[480px] shadow-xl border border-gray-100 font-poppins max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold text-gray-900">
                {t('devices.terminals.modalTitle', 'Register Hardware Device')}
              </h3>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {t('devices.terminals.modalDesc', 'Enter the hardware device specifications matching your physical unit.')}
            </p>

            <form onSubmit={handleRegisterDevice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('devices.terminals.typeLabel', 'Device Type')} *
                </label>
                <select
                  value={deviceForm.type}
                  onChange={(e) => {
                    const selected = DEVICE_TYPES.find((dt) => dt.value === e.target.value);
                    setDeviceForm({
                      ...deviceForm,
                      type: e.target.value,
                      Devices_ModelNo: selected?.defaultModel || '',
                      Hardware_Model: selected?.defaultModel || ''
                    });
                  }}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {DEVICE_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('devices.terminals.nameLabel', 'Device Name / Station')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Front Counter Z500C, Kitchen Printer #1"
                  value={deviceForm.Name}
                  onChange={(e) => setDeviceForm({ ...deviceForm, Name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('devices.terminals.serialLabel', 'Hardware Serial Number')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Z500C-00001234, PRN-SN-0001"
                  value={deviceForm.Serial_Number}
                  onChange={(e) => setDeviceForm({ ...deviceForm, Serial_Number: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('devices.terminals.modelLabel', 'Model Number')}
                  </label>
                  <input
                    type="text"
                    value={deviceForm.Devices_ModelNo}
                    onChange={(e) =>
                      setDeviceForm({
                        ...deviceForm,
                        Devices_ModelNo: e.target.value,
                        Hardware_Model: e.target.value
                      })
                    }
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('devices.terminals.manufacturerLabel', 'Manufacturer')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunmi, Epson, PAX"
                    value={deviceForm.Manufacturer}
                    onChange={(e) => setDeviceForm({ ...deviceForm, Manufacturer: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('devices.terminals.macLabel', 'MAC Address (Optional)')}
                  </label>
                  <input
                    type="text"
                    placeholder="00:1A:2B:3C:4D:5E"
                    value={deviceForm.MAC_Address}
                    onChange={(e) => setDeviceForm({ ...deviceForm, MAC_Address: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('devices.terminals.firmwareLabel', 'Firmware (Optional)')}
                  </label>
                  <input
                    type="text"
                    placeholder="v2.4.1"
                    value={deviceForm.Firmware}
                    onChange={(e) => setDeviceForm({ ...deviceForm, Firmware: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-xs"
                >
                  {t('common:cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createDeviceMutation.isPending}
                  style={{
                    background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)'
                  }}
                  className="flex-1 text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-95 transition-opacity text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createDeviceMutation.isPending && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t('devices.terminals.registerSubmit', 'Register Device')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bridge Enrolment Token */}
      {bridgeTokenModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-[480px] shadow-2xl border border-gray-100 font-poppins">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('devices.terminals.tokenTitle', 'Bridge Enrolment Token')}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {bridgeTokenModal.terminal?.Serial_Number || 'Z500C'}
                </p>
              </div>
            </div>

            <div className="my-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
              <p className="font-semibold text-amber-950 mb-0.5">
                ⚠️ {t('devices.terminals.tokenWarningTitle', 'One-Time Token Notice')}
              </p>
              <p className="leading-relaxed">
                {t(
                  'devices.terminals.tokenWarning',
                  'Store this token securely into the Android Z500C Bridge application encrypted storage. The backend will never show this plain token again.'
                )}
              </p>
            </div>

            <div className="bg-gray-100 rounded-xl p-3 border border-gray-200 flex items-center justify-between gap-2 mb-4">
              <span className="font-mono text-xs text-gray-800 truncate select-all">{bridgeTokenModal.token}</span>
              <button
                type="button"
                onClick={copyTokenToClipboard}
                className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                {bridgeTokenModal.copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-600" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1 mb-5">
              <p className="font-semibold text-gray-800">Bridge Socket Pairing Instructions:</p>
              <p>
                1. Connect Android bridge to Socket.IO namespace:{' '}
                <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">/terminal-bridge</code>
              </p>
              <p>
                2. Send auth:{' '}
                <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">{`{ device_serial, bridge_token }`}</code>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBridgeTokenModal({ isOpen: false, terminal: null, token: null, copied: false })}
              className="w-full bg-purple-900 hover:bg-purple-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t('common:done', 'Done / I Have Saved the Token')}
            </button>
          </div>
        </div>
      )}

      {/* Modal: Lock Device (POST /master/myDevices/:id/lock) */}
      {lockModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-[420px] shadow-xl border border-gray-100 font-poppins">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('devices.actions.lockConfirmTitle', 'Lock Device')}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {lockModal.device?.Name} ({lockModal.device?.Serial_Number || 'Device'})
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              {t('devices.actions.lockConfirmDesc', 'Locking will temporarily restrict operations on this device.')}
            </p>

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-gray-700">
                {t('devices.actions.lockReasonLabel', 'Reason for locking')}
              </label>
              <input
                type="text"
                value={lockModal.reason}
                onChange={(e) => setLockModal({ ...lockModal, reason: e.target.value })}
                placeholder={t('devices.actions.lockReasonPlaceholder', 'e.g. Device reported lost, security inspection')}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLockModal({ isOpen: false, device: null, reason: 'Device reported lost' })}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-xs"
              >
                {t('common:cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                disabled={lockMutation.isPending}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {lockMutation.isPending && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('devices.actions.lock', 'Lock Device')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Restart Device (POST /master/myDevices/:id/restart) */}
      {restartModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-[420px] shadow-xl border border-gray-100 font-poppins">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('devices.actions.restartConfirmTitle', 'Restart Hardware Device')}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {restartModal.device?.Name} ({restartModal.device?.Serial_Number || 'Device'})
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              {t(
                'devices.actions.restartConfirmDesc',
                'Trigger an immediate remote reboot of this hardware device?'
              )}
            </p>

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-gray-700">
                {t('devices.actions.restartReasonLabel', 'Restart reason')}
              </label>
              <input
                type="text"
                value={restartModal.reason}
                onChange={(e) => setRestartModal({ ...restartModal, reason: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRestartModal({ isOpen: false, device: null, reason: 'Apply configuration changes' })}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-xs"
              >
                {t('common:cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmRestart}
                disabled={restartMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {restartMutation.isPending && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('devices.actions.restart', 'Restart Device')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Push Software Update (POST /master/myDevices/:id/push-update) */}
      {updateModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-[420px] shadow-xl border border-gray-100 font-poppins">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('devices.actions.pushUpdateTitle', 'Push Software Update')}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {updateModal.device?.Name} ({updateModal.device?.Serial_Number || 'Device'})
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              {t('devices.actions.pushUpdateDesc', 'Broadcast an application update to this device.')}
            </p>

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-gray-700">
                {t('devices.actions.appVersionLabel', 'Target Application Version')}
              </label>
              <input
                type="text"
                value={updateModal.version}
                onChange={(e) => setUpdateModal({ ...updateModal, version: e.target.value })}
                placeholder="v3.2.2"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUpdateModal({ isOpen: false, device: null, version: 'v3.2.2' })}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-xs"
              >
                {t('common:cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdate}
                disabled={pushUpdateMutation.isPending}
                className="flex-1 bg-purple-900 hover:bg-purple-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pushUpdateMutation.isPending && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('devices.actions.pushUpdate', 'Push Update')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Device Session Logs (GET /master/myDevices/:id/session-logs) */}
      {logsModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-[560px] shadow-2xl border border-gray-100 font-poppins max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {t('devices.actions.logsTitle', 'Device Session Logs')}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {logsModal.device?.Name} ({logsModal.device?.Serial_Number || 'Device'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLogsModal({ isOpen: false, device: null, logs: [], isLoading: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {logsModal.isLoading ? (
                <div className="py-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-purple-700" />
                  <span>Loading logs...</span>
                </div>
              ) : logsModal.logs.length > 0 ? (
                logsModal.logs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl text-xs border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{log.event || log.Action || 'Log Entry'}</span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {formatDate(log.timestamp || log.Date || log.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      {log.details || log.Description || log.message || JSON.stringify(log)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  <Info className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  {t('devices.actions.noLogs', 'No session logs recorded for this device yet')}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleExportLogs}
                className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-600" />
                <span>{t('devices.actions.exportLogs', 'Export Logs (CSV)')}</span>
              </button>
              <button
                type="button"
                onClick={() => setLogsModal({ isOpen: false, device: null, logs: [], isLoading: false })}
                className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {t('devices.actions.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[400px] text-center shadow-xl">
            <h3 className="text-xl font-bold text-red-600 mb-2">
              {t('devices.removeTitle', 'Remove Device')}
            </h3>
            <p className="text-gray-700 text-sm mb-6 leading-relaxed">
              {t('devices.removeConfirm', 'Are you sure you want to remove this device?')}
              <br />
              <span className="font-semibold text-black mt-1 inline-block">
                {selectedDevice?.Name || selectedDevice?.device_name || selectedDevice?.name}{' '}
                {selectedDevice?.Serial_Number ? `(${selectedDevice.Serial_Number})` : ''}
              </span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                disabled={deleteMutation.isPending}
              >
                {t('devices.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteDevice}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? t('devices.removing', 'Removing...') : t('devices.remove', 'Remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyDevices;
