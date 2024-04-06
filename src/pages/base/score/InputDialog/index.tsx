import {ModalForm, ProForm, ProFormInstance, ProFormSelect, ProFormText} from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef } from 'react';
import { waitTime } from '@/utils/request';
import { addAScore, updateAScore } from '@/services/api/score';

interface InputDialogProps {
  detailData?: API.ScoreDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

export default function InputDialog(props: InputDialogProps) {
  const form = useRef<ProFormInstance>(null);
  interface options{
    value: number,
    label: string,
  }
  const option:options[] =[{value:1,label:'秋季'},{value:2,label:'春季'}]

  useEffect(() => {
    waitTime().then(() => {
      if (props.detailData) {
        form?.current?.setFieldsValue(props.detailData);
      } else {
        form?.current?.resetFields();
      }
    });
  }, [props.detailData, props.visible]);

  const onFinish = async (values: any) => {
    const { studentNum, chineseScore, mathScore, englishScore, academicYear, semester, classId } = values;
    const data: API.ScoreDTO = {
      id: props.detailData?.id,
      studentNum,
      chineseScore,
      mathScore,
      englishScore,
      academicYear,
      semester,
      classId,
    };

    try {
      if (props.detailData) {
        await updateAScore(data, { throwError: true });
      } else {
        await addAScore(data, { throwError: true });
      }
    } catch (ex) {
      return true;
    }

    props.onClose(true);
    message.success('保存成功');
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
      title={props.detailData ? '修改成绩' : '新建成绩'}
      open={props.visible}
    >
      <ProFormText
        name="studentNum"
        label="学号"
        rules={[
          {
            required: true,
            message: '请输入学号！',
          },
        ]}
      />
      <ProFormText
        name="classId"
        label="班级号"
        rules={[
          {
            required: true,
            message: '请输入班级号！',
          },
        ]}
      />
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
        <ProFormSelect
          name="semester"
          width="xs"
          label="学期"
          rules={[
            {
              required: true,
              message: '请选择学期！',
            },
          ]}
          options={option}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          name="chineseScore"
          label="语文成绩"
          rules={[
            () => ({
              validator(_, value) {
                if (value <= 100 && value >= 0) {
                  return Promise.resolve();
                }
                else {
                  return Promise.reject(new Error("请输入0~100之间的数值"));
                }
              },
              required: true,
            }),
          ]}
        />
        <ProFormText
          name="mathScore"
          label="数学成绩"
          rules={[
            () => ({
              validator(_, value) {
                if (value <= 100 && value >= 0) {
                  return Promise.resolve();
                }
                else {
                  return Promise.reject(new Error("请输入0~100之间的数值"));
                }
              },
              required: true,
            }),
          ]}
        />
        <ProFormText
          name="englishScore"
          label="英语成绩"
          rules={[
            () => ({
              validator(_, value) {
                if (value <= 100 && value >= 0) {
                  return Promise.resolve();
                }
                else {
                  return Promise.reject(new Error("请输入0~100之间的数值"));
                }
              },
              required: true,
            }),
          ]}
        />
      </ProForm.Group>
    </ModalForm>
  );
}
