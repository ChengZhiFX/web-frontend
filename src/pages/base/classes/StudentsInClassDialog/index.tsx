import { ModalForm, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { convertPageData, orderBy, waitTime } from '@/utils/request';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import {listStudents} from "@/services/api/students";

interface StudentsInClassDialogProps {
  detailData?: API.ClassesDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

let classId: number;
let className: string;

export default function StudentsInClassDialog(props: StudentsInClassDialogProps) {
  const refAction = useRef<ActionType>(null);
  const [searchProps, setSearchProps] = useState<API.ClassesQueryDTO>({});

  const form = useRef<ProFormInstance>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const columns: ProColumns<API.StudentsVO>[] = [
    {
      title: '姓名',
      dataIndex: 'studentName',
      width: 80,
    },
    {
      title: '学号',
      dataIndex: 'studentNum',
      width: 120,

    },
    {
      title: '性别',
      dataIndex: 'gender',
      search: false,
      filters: true,
      onFilter: true,
      ellipsis: true,
      width: 70,
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
  ];

  const onFinish = async (values: any) => {
    refAction.current?.reload();
    return true;
  };

  return (
    <ModalForm
      width={600}
      onFinish={onFinish}
      formRef={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.onClose(false),
      }}
      title={props.detailData?.className}
      submitter={{
        searchConfig: {
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      open={props.visible}
    >
      <ProTable<API.StudentsVO>
        actionRef={refAction}
        rowKey="classId"
        request={async (params = {}) => {
          const data: API.StudentsQueryDTO = {
            ...params,
            classId: props.detailData?.id,
          };
          return convertPageData(await listStudents(data));
        }}
        columns={columns}
        search={false}
        options={false}
      />
    </ModalForm>
  );
}

export type OptionConfig = {
  density?: false;
  reload?: false;
  setting?: false;
  search?: false;
  reloadIcon?: React.ReactNode;
  densityIcon?: React.ReactNode;
};
