import { ModalForm, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { convertPageData, orderBy, waitTime } from '@/utils/request';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, message, Space} from 'antd';
import { useEffect, useRef, useState } from 'react';
import {openConfirm} from "@/utils/ui";
import {deleteScores, listScores} from "@/services/api/score";
import InputDialog from "@/pages/base/score/InputDialog";
import {ExportOutlined, PlusOutlined} from "@ant-design/icons";
import {downloadFile} from "@/utils/download-utils";

interface ScoresOfStudentDialogProps {
  detailData?: API.StudentsDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

export default function ScoresOfStudentDialog(props: ScoresOfStudentDialogProps) {
  const refAction = useRef<ActionType>(null);
  const [downloading, setDownloading] = useState(false);
  const [visible, setVisible] = useState(false);
  const form = useRef<ProFormInstance>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const [score, setScore] = useState<API.ScoreVO>();
  const columns: ProColumns<API.ScoreVO>[] = [
    {
      title: '流水号',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '学年',
      dataIndex: 'academicYear',
      width: 80,
      sorter: true
    },
    {
      title: '学期',
      dataIndex: 'semester',
      filters: true,
      onFilter: true,
      ellipsis: true,
      width: 80,
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
      title: '语文成绩',
      dataIndex: 'chineseScore',
      width: 90,
      search: false,
      sorter: true
    },
    {
      title: '数学成绩',
      dataIndex: 'mathScore',
      width: 90,
      search: false,
      sorter: true
    },
    {
      title: '英语成绩',
      dataIndex: 'englishScore',
      width: 90,
      search: false,
      sorter: true
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      width: 90,
      search: false,
      sorter: true
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

  const onFinish = async (values: any) => {
    props.onClose(true);
    window.location.reload();
    return true;
  };

  const handleDelete = async () => {
    if (!selectedRowKeys?.length) return;
    openConfirm(`确实要永久删除这 ${selectedRowKeys.length} 项吗？`, async () => {
      await deleteScores(selectedRowKeys);
      refAction.current?.clearSelected!();
      refAction.current?.reload();
    });
  };

  const handleExport = () => {
    const searchProps: API.ScoreQueryDTO = {
      studentNum: props.detailData?.studentNum,
    };
    setDownloading(true);
    downloadFile(`/api/score/exportScores`, searchProps, props.detailData?.studentName + '的成绩单.xls').then(() => {
      waitTime(1000).then(() => setDownloading(false));
    });
  };

  return (
    <ModalForm
      width={900}
      onFinish={onFinish}
      formRef={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.onClose(false),
      }}
      title={props.detailData?.studentName + ' 的成绩单'}
      submitter={{
        searchConfig: {
          submitText: '好',
        },
        resetButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      open={props.visible}
    >
      <ProTable<API.ScoreVO>
        actionRef={refAction}
        rowKey="id"
        request={async (params = {}, sort) => {
          const data: API.ScoreQueryDTO = {
            ...params,
            orderBy: orderBy(sort),
            studentNum: props.detailData?.studentNum,
          };
          return convertPageData(await listScores(data));
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
        columns={columns}
        rowSelection={{
          onChange: (rowKeys) => {
            selectRow(rowKeys as number[]);
          },
        }}
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setScore(props.detailData);
              setVisible(true);
            }}
            disabled={selectedRowKeys.length > 0}
          >
            <PlusOutlined/> 新建
          </Button>,
          <Button type="default" onClick={handleExport} loading={downloading} disabled={selectedRowKeys.length>0}>
            <ExportOutlined /> 导出
          </Button>,
        ]}
      />
      <InputDialog
        detailData={score}
        onClose={(result) => {
          setVisible(false);
          result && refAction.current?.reload();
        }}
        visible={visible}
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
