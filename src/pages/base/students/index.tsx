import { deleteAStudent, deleteStudents, listStudents } from '@/services/api/students';
import { convertPageData, orderBy, waitTime } from '@/utils/request';
import { openConfirm } from '@/utils/ui';
import { PlusOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { useRef, useState } from 'react';
import InputDialog from './InputDialog';
import { downloadFile } from '@/utils/download-utils';
import { Link } from '@umijs/max';
import ImportDialog from './ImportDialog';

export default () => {
  const refAction = useRef<ActionType>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const [importVisible, setImportVisible] = useState(false);
  const [students, setStudents] = useState<API.StudentsVO>();
  const [searchProps, setSearchProps] = useState<API.StudentsQueryDTO>({});
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const columns: ProColumns<API.StudentsVO>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
      search: false,
    },
    {
      title: '姓名',
      dataIndex: 'studentName',
      width: 100,
    },
    {
      title: '学号',
      dataIndex: 'studentNum',
      width: 100,

    },
    {
      title: '性别',
      dataIndex: 'gender',
      search: false,
      filters: true,
      onFilter: true,
      ellipsis: true,
      width: 60,
      render: (_: any, record) => {
        return record?.gender ? '男' : '女';
      },
      valueType: 'select',
      valueEnum: {
        0: {
          text: '女',
        },
        1: {
          text: '男',
        },
      }
    },
    {
      title: '家长姓名',
      dataIndex: 'parentName',
      width: 100,
      search: false,
    },
    {
      title: '家长电话',
      dataIndex: 'parentTel',
      width: 100,
      search: false,
    },
    {
      title: '所属班级号',
      dataIndex: 'classId',
      width: 100,
      sorter: true,
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
            setStudents(record);
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
            await deleteStudents(arr);
            refAction.current?.reload();
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
      await deleteStudents(selectedRowKeys);
      window.location.reload();
    });
  };

  const handleExport = () => {
    setDownloading(true);
    downloadFile(`/api/students/exportStudents`, searchProps, '学生导出表.xls').then(() => {
      waitTime(1000).then(() => setDownloading(false));
    });
  };

  return (
    <PageContainer>
      <ProTable<API.StudentsVO>
        actionRef={refAction}
        rowKey="id"
        request={async (params = {}, sort) => {
          const props = {
            ...params,
            orderBy: orderBy(sort),
          };
          setSearchProps(props);
          return convertPageData(await listStudents(props));
        }}
        tableAlertOptionRender={({
          selectedRowKeys,
          selectedRows,
          onCleanSelected,
        }) => {
          return (
            <Space size={16}>
              <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}> 取消选择 </a>
              <a onClick={handleDelete} style={{color: '#FF4D4F'}}>批量删除</a>
            </Space>
          );
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setStudents(undefined);
              setVisible(true);
            }}
            disabled={selectedRowKeys.length>0}
          >
            <PlusOutlined /> 新建
          </Button>,
          // <Button
          //   type="primary"
          //   key="primary"
          //   danger
          //   onClick={handleDelete}
          //   disabled={!selectedRowKeys?.length}
          // >
          //   <DeleteOutlined /> 删除
          // </Button>,
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
            <ExportOutlined /> 导出当前视图
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
        detailData={students}
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
    </PageContainer>
  );
};