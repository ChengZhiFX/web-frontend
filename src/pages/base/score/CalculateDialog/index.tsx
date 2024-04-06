import { ModalForm, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { convertPageData, orderBy, waitTime } from '@/utils/request';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getAverageOfClass } from '@/services/api/score';

interface CalculateDialogProps {
  detailData?: API.AverageQueryDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

export default function CalculateDialog(props: CalculateDialogProps) {
  const refAction = useRef<ActionType>(null);
  const form = useRef<ProFormInstance>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const columns: ProColumns<API.AverageVO>[] = [
    {
      title: '班级号',
      dataIndex: 'classId',
      width: 60,
      search: false,
      defaultSortOrder: 'ascend',
      sorter: (a,b) => {
        // @ts-ignore
        return a.classId - b.classId;
      },
    },
    {
      title: '语文平均分',
      dataIndex: 'averageChineseScore',
      width: 80,
      search: false,
      sorter: (a,b) => {
        // @ts-ignore
        return a.averageChineseScore - b.averageChineseScore;
      },
    },
    {
      title: '数学平均分',
      dataIndex: 'averageMathScore',
      width: 80,
      search: false,
      sorter: (a,b) => {
        // @ts-ignore
        return a.averageMathScore - b.averageMathScore;
      },
    },
    {
      title: '英语平均分',
      dataIndex: 'averageEnglishScore',
      width: 80,
      search: false,
      sorter: (a,b) => {
        // @ts-ignore
        return a.averageEnglishScore - b.averageEnglishScore;
      },
    },
    {
      title: '总平均分',
      dataIndex: 'averageTotalScore',
      width: 80,
      search: false,
      sorter: (a,b) => {
        // @ts-ignore
        return a.averageTotalScore - b.averageTotalScore;
      },
    },
  ];

  useEffect(() => {
    waitTime().then(() => {
      if (props.detailData) {
        form?.current?.setFieldsValue(props.detailData);
      } else {
        form?.current?.resetFields();
      }
    });
  }, [props.detailData, props.visible]);
  var data: API.AverageQueryDTO;
  const onFinish = async (values: any) => {
    const { academicYear, semester } = values;
    data = {
      academicYear,
      semester,
    };
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
      title={'班级平均成绩'}
      submitter={{
        searchConfig: {
          submitText: '查询',
          resetText: '关闭',
        },
      }}
      open={props.visible}
    >
      <ProForm.Group>
        <ProFormText
          name="academicYear"
          label="学年"
          rules={[
            {
              required: true,
              message: '请输入学年！',
            },
          ]}
        />
        <ProFormText name="semester" label="学期"/>
      </ProForm.Group>
      <ProTable<API.AverageVO>
        actionRef={refAction}
        rowKey="classId"
        request={async (params = {}) => {
          const { academicYear, semester } = data;
          const props: API.AverageQueryDTO = {
            ...params,
            academicYear,
            semester,
          };
          return convertPageData(await getAverageOfClass(props));
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