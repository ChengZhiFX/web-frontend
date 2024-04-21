import { deleteClasses, listClasses } from '@/services/api/classes';
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
import StudentsInClassDialog from "./StudentsInClassDialog";

export default () => {
  const refAction = useRef<ActionType>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const [importVisible, setImportVisible] = useState(false);
  const [studentsInClassVisible, setStudentsInClassVisible] = useState(false);
  const [classes, setClasses] = useState<API.ClassesVO>();
  const [searchProps, setSearchProps] = useState<API.ClassesQueryDTO>({});
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const columns: ProColumns<API.ClassesVO>[] = [
    {
      title: '班级号',
      dataIndex: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: '班级名称',
      dataIndex: 'className',
      width: 100,
      sorter: true
    },
    {
      title: '班级人数',
      dataIndex: 'totalStudents',
      width: 70,
      render: (dom, record) => {
        return (
          <a
            onClick={() => {
              setClasses(record);
              setStudentsInClassVisible(true);
            }}
          >
            {dom}
          </a>
        );
      },
      search: false,
    },
    {
      title: '语文教师',
      dataIndex: 'chineseTeacher',
      width: 80,
    },
    {
      title: '数学教师',
      dataIndex: 'mathTeacher',
      width: 80,
    },
    {
      title: '英语教师',
      dataIndex: 'englishTeacher',
      width: 80,
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="query"
          onClick={() => {
            setClasses(record);
            setStudentsInClassVisible(true);
          }}
        >
          查看/修改学生
        </a>,
        <a
          key="modify"
          onClick={() => {
            setClasses(record);
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
            await deleteClasses(arr);
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
      await deleteClasses(selectedRowKeys);
      window.location.reload();
    });
  };

  const handleExport = () => {
    setDownloading(true);
    downloadFile(`/api/classes/exportClasses`, searchProps, '班级导出表.xls').then(() => {
      waitTime(1000).then(() => setDownloading(false));
    });
  };

  return (
    <PageContainer>
      <ProTable<API.ClassesVO>
        actionRef={refAction}
        rowKey="id"
        request={async (params = {}, sort) => {
          const props = {
            ...params,
            orderBy: orderBy(sort),
          };
          setSearchProps(props);
          return convertPageData(await listClasses(props));
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
        search={{
          showHiddenNum: true
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setClasses(undefined);
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
        detailData={classes}
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
      <StudentsInClassDialog
        detailData={classes}
        visible={studentsInClassVisible}
        onClose={(count) => {
          setStudentsInClassVisible(false);
          if (count) {
            refAction.current?.reload();
          }
        }}
      />
    </PageContainer>
  );
};
