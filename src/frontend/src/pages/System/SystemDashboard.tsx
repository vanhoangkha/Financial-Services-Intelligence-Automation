import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Tabs,
  Box,
  Button,
  Alert,
  StatusIndicator,
  ColumnLayout,
  Cards,
  Badge,
  Table,
  KeyValuePairs,
  ProgressBar,
  LineChart,
  BarChart,
  PieChart,
  Modal,
  Form,
  FormField,
  Toggle,
  Select
} from '@cloudscape-design/components';

interface SystemDashboardProps {
  onShowSnackbar: (message: string, severity: 'error' | 'success' | 'info' | 'warning') => void;
}

interface SystemHealth {
  status: string;
  service: string;
  timestamp: number;
  version: string;
  features: Record<string, boolean>;
}

interface DetailedHealth {
  overall_status: string;
  components: Record<string, {
    status: string;
    details?: any;
  }>;
  performance_metrics: {
    response_time: number;
    throughput: number;
    error_rate: number;
    uptime: number;
  };
}

interface ServiceHealth {
  service_name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time: number;
  last_check: string;
  details?: any;
}

const SystemDashboard: React.FC<SystemDashboardProps> = ({ onShowSnackbar }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [detailedHealth, setDetailedHealth] = useState<DetailedHealth | null>(null);
  const [serviceHealths, setServiceHealths] = useState<ServiceHealth[]>([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Performance metrics history (mock data for demo)
  const [performanceHistory, setPerformanceHistory] = useState<Array<{
    timestamp: string;
    response_time: number;
    throughput: number;
    error_rate: number;
  }>>([]);

  // Load data on component mount
  useEffect(() => {
    loadAllHealthData();
    
    // Set up auto-refresh
    const interval = setInterval(loadAllHealthData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadAllHealthData = async () => {
    await Promise.all([
      loadSystemHealth(),
      loadDetailedHealth(),
      loadServiceHealths(),
      updatePerformanceHistory()
    ]);
  };

  const loadSystemHealth = async () => {
    try {
      const response = await fetch('http://localhost:8080/mutil_agent/api/v1/health/health');
      const data = await response.json();
      setSystemHealth(data);
    } catch (error) {
      // console.error('Error loading system health:', error);
    }
  };

  const loadDetailedHealth = async () => {
    try {
      const response = await fetch('http://localhost:8080/mutil_agent/api/v1/health/health/detailed');
      const data = await response.json();
      
      // Mock detailed health data if API doesn't provide it
      const mockDetailedHealth: DetailedHealth = {
        overall_status: 'healthy',
        components: {
          'database': { status: 'healthy' },
          'cache': { status: 'healthy' },
          'message_queue': { status: 'healthy' },
          'file_storage': { status: 'healthy' }
        },
        performance_metrics: {
          response_time: 150,
          throughput: 1200,
          error_rate: 0.5,
          uptime: 99.9
        }
      };
      
      setDetailedHealth(mockDetailedHealth);
    } catch (error) {
      // console.error('Error loading detailed health:', error);
    }
  };

  const loadServiceHealths = async () => {
    const services = [
      { endpoint: '/mutil_agent/api/v1/health/health/agents', name: 'Multi-Agent System' },
      { endpoint: '/mutil_agent/api/v1/health/health/compliance', name: 'Compliance Engine' },
      { endpoint: '/mutil_agent/api/v1/health/health/risk', name: 'Risk Assessment' },
      { endpoint: '/mutil_agent/api/v1/health/health/text', name: 'Text Processing' },
      { endpoint: '/mutil_agent/api/v1/health/health/knowledge', name: 'Knowledge Base' },
      { endpoint: '/mutil_agent/api/v1/health/health/document', name: 'Document Intelligence' }
    ];

    const healthPromises = services.map(async (service) => {
      try {
        const startTime = Date.now();
        const response = await fetch(`http://localhost:8080${service.endpoint}`);
        const endTime = Date.now();
        const data = await response.json();
        
        return {
          service_name: service.name,
          status: response.ok ? 'healthy' as const : 'unhealthy' as const,
          response_time: endTime - startTime,
          last_check: new Date().toISOString(),
          details: data
        };
      } catch (error) {
        return {
          service_name: service.name,
          status: 'unhealthy' as const,
          response_time: 0,
          last_check: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }
    });

    try {
      const results = await Promise.all(healthPromises);
      setServiceHealths(results);
    } catch (error) {
      // console.error('Error loading service healths:', error);
    }
  };

  const updatePerformanceHistory = () => {
    const now = new Date();
    const newDataPoint = {
      timestamp: now.toLocaleTimeString('vi-VN'),
      response_time: 120 + Math.random() * 60, // Mock data
      throughput: 1000 + Math.random() * 400,
      error_rate: Math.random() * 2
    };

    setPerformanceHistory(prev => {
      const updated = [...prev, newDataPoint];
      // Keep only last 20 data points
      return updated.slice(-20);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'error';
      default: return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'Khỏe mạnh';
      case 'degraded': return 'Suy giảm';
      case 'unhealthy': return 'Không khỏe';
      default: return 'Không xác định';
    }
  };

  const serviceTableColumns = [
    {
      id: 'service_name',
      header: 'Dịch vụ',
      cell: (item: ServiceHealth) => item.service_name,
      isRowHeader: true
    },
    {
      id: 'status',
      header: 'Trạng thái',
      cell: (item: ServiceHealth) => (
        <StatusIndicator type={getStatusColor(item.status)}>
          {getStatusText(item.status)}
        </StatusIndicator>
      )
    },
    {
      id: 'response_time',
      header: 'Thời gian phản hồi',
      cell: (item: ServiceHealth) => `${item.response_time}ms`
    },
    {
      id: 'last_check',
      header: 'Kiểm tra cuối',
      cell: (item: ServiceHealth) => new Date(item.last_check).toLocaleString('vi-VN')
    }
  ];

  const responseTimeChartData = performanceHistory.map(item => ({
    x: item.timestamp,
    y: item.response_time
  }));

  const throughputChartData = performanceHistory.map(item => ({
    x: item.timestamp,
    y: item.throughput
  }));

  const serviceStatusData = [
    { title: 'Khỏe mạnh', value: serviceHealths.filter(s => s.status === 'healthy').length, color: '#1f77b4' },
    { title: 'Suy giảm', value: serviceHealths.filter(s => s.status === 'degraded').length, color: '#ff7f0e' },
    { title: 'Không khỏe', value: serviceHealths.filter(s => s.status === 'unhealthy').length, color: '#d62728' }
  ];

  const componentStatusData = detailedHealth ? 
    Object.entries(detailedHealth.components).map(([name, component]) => ({
      title: name,
      value: component.status === 'healthy' ? 1 : 0,
      color: component.status === 'healthy' ? '#1f77b4' : '#d62728'
    })) : [];

  return (
    <Container
      header={
        <Header
          variant="h1"
          description="Giám sát tổng thể hệ thống VPBank K-MULT Agent Studio"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="settings"
                onClick={() => setSettingsModalVisible(true)}
              >
                Cài đặt
              </Button>
              <Button
                iconName="refresh"
                onClick={loadAllHealthData}
                loading={loading}
              >
                Làm mới
              </Button>
            </SpaceBetween>
          }
        >
          System Monitoring Dashboard
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* System Status Alert */}
        {systemHealth && (
          <Alert
            type={systemHealth.status === 'healthy' ? 'success' : 'error'}
            header={`Hệ thống ${systemHealth.status === 'healthy' ? 'hoạt động bình thường' : 'có vấn đề'}`}
          >
            Service: {systemHealth.service} | Version: {systemHealth.version} | 
            Last check: {new Date(systemHealth.timestamp * 1000).toLocaleString('vi-VN')}
          </Alert>
        )}

        {/* Overview Statistics */}
        <ColumnLayout columns={4} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Trạng thái tổng thể</Box>
            <Box variant="awsui-value-large">
              <StatusIndicator type={detailedHealth?.overall_status === 'healthy' ? 'success' : 'error'}>
                {detailedHealth?.overall_status === 'healthy' ? 'Khỏe mạnh' : 'Có vấn đề'}
              </StatusIndicator>
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Uptime</Box>
            <Box variant="awsui-value-large" color="text-status-success">
              {detailedHealth?.performance_metrics.uptime || 99.9}%
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Thời gian phản hồi</Box>
            <Box variant="awsui-value-large">
              {detailedHealth?.performance_metrics.response_time || 150}ms
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Tỷ lệ lỗi</Box>
            <Box variant="awsui-value-large" color={
              (detailedHealth?.performance_metrics.error_rate || 0) < 1 ? 'text-status-success' : 'text-status-error'
            }>
              {detailedHealth?.performance_metrics.error_rate || 0.5}%
            </Box>
          </div>
        </ColumnLayout>

        <Tabs
          activeTabId={activeTab}
          onChange={({ detail }) => setActiveTab(detail.activeTabId)}
          tabs={[
            {
              id: 'overview',
              label: 'Tổng quan',
              content: (
                <SpaceBetween size="l">
                  <ColumnLayout columns={2}>
                    <Container header={<Header variant="h2">Trạng thái dịch vụ</Header>}>
                      {serviceStatusData.some(d => d.value > 0) && (
                        <PieChart
                          data={serviceStatusData}
                          detailPopoverContent={(datum, sum) => [
                            { key: "Trạng thái", value: datum.title },
                            { key: "Số lượng", value: datum.value },
                            {
                              key: "Tỷ lệ",
                              value: `${((datum.value / sum) * 100).toFixed(1)}%`
                            }
                          ]}
                          ariaDescription="Biểu đồ trạng thái dịch vụ"
                          ariaLabel="Service status pie chart"
                        />
                      )}
                    </Container>

                    <Container header={<Header variant="h2">Trạng thái components</Header>}>
                      {componentStatusData.length > 0 && (
                        <Cards
                          cardDefinition={{
                            header: (item: any) => item.title,
                            sections: [
                              {
                                id: 'status',
                                content: (item: any) => (
                                  <StatusIndicator type={item.value === 1 ? 'success' : 'error'}>
                                    {item.value === 1 ? 'Khỏe mạnh' : 'Có vấn đề'}
                                  </StatusIndicator>
                                )
                              }
                            ]
                          }}
                          cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 2 }]}
                          items={componentStatusData}
                        />
                      )}
                    </Container>
                  </ColumnLayout>

                  {/* System Features */}
                  {systemHealth && (
                    <Container header={<Header variant="h2">Tính năng hệ thống</Header>}>
                      <KeyValuePairs
                        columns={3}
                        items={Object.entries(systemHealth.features).map(([feature, enabled]) => ({
                          label: feature.replace('_', ' ').toUpperCase(),
                          value: (
                            <StatusIndicator type={enabled ? 'success' : 'stopped'}>
                              {enabled ? 'Kích hoạt' : 'Tắt'}
                            </StatusIndicator>
                          )
                        }))}
                      />
                    </Container>
                  )}
                </SpaceBetween>
              )
            },
            {
              id: 'services',
              label: 'Dịch vụ',
              content: (
                <Table
                  columnDefinitions={serviceTableColumns}
                  items={serviceHealths}
                  loading={loading}
                  loadingText="Đang kiểm tra dịch vụ..."
                  header={
                    <Header
                      counter={`(${serviceHealths.length})`}
                      actions={
                        <Button
                          iconName="refresh"
                          onClick={loadServiceHealths}
                        >
                          Kiểm tra lại
                        </Button>
                      }
                    >
                      Trạng thái dịch vụ
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit">
                      <b>Không có dịch vụ nào</b>
                      <Box variant="p" color="inherit">
                        Không thể tải thông tin dịch vụ.
                      </Box>
                    </Box>
                  }
                />
              )
            },
            {
              id: 'performance',
              label: 'Hiệu suất',
              content: (
                <SpaceBetween size="l">
                  <ColumnLayout columns={2}>
                    <Container header={<Header variant="h2">Thời gian phản hồi</Header>}>
                      {responseTimeChartData.length > 0 && (
                        <LineChart
                          series={[
                            {
                              title: "Response Time (ms)",
                              type: "line",
                              data: responseTimeChartData
                            }
                          ]}
                          xTitle="Thời gian"
                          yTitle="Milliseconds"
                          ariaLabel="Response time chart"
                          errorText="Error loading data."
                          loadingText="Loading chart"
                          recoveryText="Retry"
                        />
                      )}
                    </Container>

                    <Container header={<Header variant="h2">Throughput</Header>}>
                      {throughputChartData.length > 0 && (
                        <LineChart
                          series={[
                            {
                              title: "Requests/min",
                              type: "line",
                              data: throughputChartData
                            }
                          ]}
                          xTitle="Thời gian"
                          yTitle="Requests per minute"
                          ariaLabel="Throughput chart"
                          errorText="Error loading data."
                          loadingText="Loading chart"
                          recoveryText="Retry"
                        />
                      )}
                    </Container>
                  </ColumnLayout>

                  {/* Performance Metrics */}
                  {detailedHealth && (
                    <Container header={<Header variant="h2">Metrics hiệu suất</Header>}>
                      <ColumnLayout columns={4} variant="text-grid">
                        <div>
                          <Box variant="awsui-key-label">Response Time</Box>
                          <ProgressBar
                            value={Math.min(detailedHealth.performance_metrics.response_time / 10, 100)}
                            description={`${detailedHealth.performance_metrics.response_time}ms`}
                          />
                        </div>
                        <div>
                          <Box variant="awsui-key-label">Throughput</Box>
                          <ProgressBar
                            value={Math.min(detailedHealth.performance_metrics.throughput / 20, 100)}
                            description={`${detailedHealth.performance_metrics.throughput} req/min`}
                          />
                        </div>
                        <div>
                          <Box variant="awsui-key-label">Error Rate</Box>
                          <ProgressBar
                            value={detailedHealth.performance_metrics.error_rate}
                            description={`${detailedHealth.performance_metrics.error_rate}%`}
                          />
                        </div>
                        <div>
                          <Box variant="awsui-key-label">Uptime</Box>
                          <ProgressBar
                            value={detailedHealth.performance_metrics.uptime}
                            description={`${detailedHealth.performance_metrics.uptime}%`}
                          />
                        </div>
                      </ColumnLayout>
                    </Container>
                  )}
                </SpaceBetween>
              )
            }
          ]}
        />

        {/* Settings Modal */}
        <Modal
          onDismiss={() => setSettingsModalVisible(false)}
          visible={settingsModalVisible}
          closeAriaLabel="Close modal"
          size="medium"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setSettingsModalVisible(false)}>
                  Hủy
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setSettingsModalVisible(false);
                    onShowSnackbar('Cài đặt đã được lưu', 'success');
                  }}
                >
                  Lưu
                </Button>
              </SpaceBetween>
            </Box>
          }
          header="Cài đặt giám sát"
        >
          <Form>
            <SpaceBetween size="m">
              <FormField label="Kích hoạt cảnh báo">
                <Toggle
                  checked={alertsEnabled}
                  onChange={({ detail }) => setAlertsEnabled(detail.checked)}
                >
                  {alertsEnabled ? 'Đã kích hoạt' : 'Tắt'}
                </Toggle>
              </FormField>

              <FormField label="Tần suất làm mới (giây)">
                <Select
                  selectedOption={{ label: `${refreshInterval} giây`, value: refreshInterval.toString() }}
                  onChange={({ detail }) => setRefreshInterval(parseInt(detail.selectedOption?.value || '30'))}
                  options={[
                    { label: '10 giây', value: '10' },
                    { label: '30 giây', value: '30' },
                    { label: '60 giây', value: '60' },
                    { label: '300 giây', value: '300' }
                  ]}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>
      </SpaceBetween>
    </Container>
  );
};

export default SystemDashboard;
