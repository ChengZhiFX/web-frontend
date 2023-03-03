import { deleteDepartment, listDepartment } from '@/services/api/department';
import { convertPageData } from '@/utils/request';
import { openConfirm } from '@/utils/ui';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import InputDialog from './InputDialog';

export default () => {
  const refAction = useRef<ActionType>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const [department, setDepartment] = useState<API.DepartmentVO>();
  const [visible, setVisible] = useState(false);
  const columns: ProColumns<API.DepartmentVO>[] = [
    {
      title: '部门ID',
      dataIndex: 'id',
      width: 100,
      search: false,
    },
    {
      title: '部门名称',
      dataIndex: 'departmentName',
      width: 100,
      render: (dom, record) => {
        return (
          <a
            onClick={() => {
              setDepartment(record);
              setVisible(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      width: 100,
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'description',
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'createdByDesc',
      width: 100,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      search: false,
    },
  ];

  const handleDelete = async () => {
    if (!selectedRowKeys?.length) return;
    openConfirm(`您确定删除${selectedRowKeys.length}条记录吗`, async () => {
      await deleteDepartment(selectedRowKeys);
      refAction.current?.reload();
    });
  };

  return (
    <PageContainer>
      <ProTable<API.DepartmentVO>
        actionRef={refAction}
        rowKey="id"
        request={async (params = {}) => {
          return convertPageData(await listDepartment(params));
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setDepartment(undefined);
              setVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
          <Button
            type="primary"
            key="primary"
            danger
            onClick={handleDelete}
            disabled={!selectedRowKeys?.length}
          >
            <DeleteOutlined /> 删除
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
        detailData={department}
        onClose={(result) => {
          setVisible(false);
          result && refAction.current?.reload();
        }}
        visible={visible}
      />
    </PageContainer>
  );
};
