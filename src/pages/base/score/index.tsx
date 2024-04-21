import { deleteScores, listScores } from '@/services/api/score';
import { convertPageData, orderBy, waitTime } from '@/utils/request';
import { openConfirm } from '@/utils/ui';
import { PlusOutlined, ImportOutlined, ExportOutlined, CalculatorOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { useRef, useState } from 'react';
import InputDialog from './InputDialog';
import { downloadFile } from '@/utils/download-utils';
import { Link } from '@umijs/max';
import ImportDialog from './ImportDialog';
import CalculateDialog from './CalculateDialog';

export default () => {
  const refAction = useRef<ActionType>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const [importVisible, setImportVisible] = useState(false);
  const [score, setScore] = useState<API.ScoreVO>();
  const [calculateVisible, setCalculateVisible] = useState(false);
  const [searchProps, setSearchProps] = useState<API.ScoreQueryDTO>({});
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const columns: ProColumns<API.ScoreVO>[] = [
    {
      title: '流水号',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '姓名',
      dataIndex: 'studentName',
      width: 60,
      search: false
    },
    {
      title: '学号',
      dataIndex: 'studentNum',
      width: 100,
      sorter: true,
    },
    {
      title: '语文成绩',
      dataIndex: 'chineseScore',
      width: 90,
      sorter: true,
      search: false,
    },
    {
      title: '数学成绩',
      dataIndex: 'mathScore',
      width: 90,
      sorter: true,
      search: false,
    },
    {
      title: '英语成绩',
      dataIndex: 'englishScore',
      width: 90,
      sorter: true,
      search: false,
    },
    {
      title: '总成绩',
      dataIndex: 'totalScore',
      width: 80,
      sorter: true,
      search: false,
    },
    {
      title: '学年',
      dataIndex: 'academicYear',
      width: 70,
      sorter: true,
    },
    {
      title: '学期',
      dataIndex: 'semester',
      filters: true,
      onFilter: true,
      ellipsis: true,
      width: 70,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '秋季',
        },
        2: {
          text: '春季',
        },
      }
    },
    {
      title: '班级号',
      dataIndex: 'classId',
      width: 80,
      sorter: true,
    },
    {
      title: '录入时间',
      width: 90,
      key: 'showTime',
      search: false,
      sorter: true,
      dataIndex: 'entryEvent',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="modify"
          onClick={() => {
            setScore(record);
            setVisible(true);
          }}
        >
          修改
        </a>,
        <a
          key="delete"
          onClick={async () => {
            openConfirm(`确实要永久性地删除此记录吗？`, async () => {
              let arr:number[] = [record.id!];
              await deleteScores(arr);
              window.location.reload();
            });
          }}
          style={{
            color: '#FF4D4F'
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  const handleDelete = async () => {
    if (!selectedRowKeys?.length) return;
    openConfirm(`确实要永久删除这 ${selectedRowKeys.length} 项吗？`, async () => {
      await deleteScores(selectedRowKeys);
      window.location.reload();
    });
  };

  const handleExport = () => {
    setDownloading(true);
    downloadFile(`/api/score/exportScores`, searchProps, '成绩导出表.xls').then(() => {
      waitTime(1000).then(() => setDownloading(false));
    });
  };

  return (
    <PageContainer>
      <ProTable<API.ScoreVO>
        actionRef={refAction}
        rowKey="id"
        request={async (params = {}, sort) => {
          const props = {
            ...params,
            orderBy: orderBy(sort),
          };
          setSearchProps(props);
          return convertPageData(await listScores(props));
        }}
        tableAlertOptionRender={({
          selectedRowKeys,
          selectedRows,
          onCleanSelected,
        }) => {
          return (
            <Space size={16}>
              <span>{`语文平均分: ${(selectedRows.reduce(
                (pre, item) => pre + item.chineseScore!,
                0,
              ) / selectedRowKeys.length).toFixed(1)}`}</span>
              <span>{`数学平均分: ${(selectedRows.reduce(
                (pre, item) => pre + item.mathScore!,
                0,
              ) / selectedRowKeys.length).toFixed(1)}`}</span>
              <span>{`英语平均分: ${(selectedRows.reduce(
                (pre, item) => pre + item.englishScore!,
                0,
              ) / selectedRowKeys.length).toFixed(1)}`}</span>
              <span>{`总平均分: ${(selectedRows.reduce(
                (pre, item) => pre + item.totalScore!,
                0,
              ) / selectedRowKeys.length).toFixed(1)}`}</span>
              <a style={{marginInlineStart: 8}} onClick={onCleanSelected}> 取消选择 </a>
              <a onClick={handleDelete} style={{color: '#FF4D4F'}}>批量删除</a>
            </Space>
          );
        }}
        search={{
          span: 6,
          showHiddenNum: true
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
          onClick={() => {
            setCalculateVisible(true);
          }}
          disabled={selectedRowKeys.length>0}
          >
            <CalculatorOutlined />计算班级平均分
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setScore(undefined);
              setVisible(true);
            }}
            disabled={selectedRowKeys.length>0}
          >
            <PlusOutlined /> 新建
          </Button>,
          <Button
            type="default"
            icon={<ImportOutlined />}
            onClick={() => {
              setImportVisible(true);
            }}
            disabled={selectedRowKeys.length>0}
          >
            导入
          </Button>,
          <Button type="default" onClick={handleExport} loading={downloading} disabled={selectedRowKeys.length>0}>
            <ExportOutlined /> 导出
          </Button>,
        ]}
        columns={columns}
        rowSelection={{
          onChange: (rowKeys) => {
            selectRow(rowKeys as number[]);
          },
        }}
      />
      <InputDialog
        detailData={score}
        onClose={(result) => {
          setVisible(false);
          result && refAction.current?.reload();
        }}
        visible={visible}
      />
      <ImportDialog
        visible={importVisible}
        onClose={(count) => {
          setImportVisible(false);
          if (count) {
            refAction.current?.reload();
          }
        }}
      />
      <CalculateDialog
        visible={calculateVisible}
        onClose={(count) => {
          setCalculateVisible(false);
          if (count) {
            refAction.current?.reload();
          }
        }}
      />
    </PageContainer>
  );
};
