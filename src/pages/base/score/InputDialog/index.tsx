import { ModalForm, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
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
        <ProFormText
          name="semester"
          label="学期"
          rules={[
            {
              required: true,
              message: '请输入学期！',
            },
          ]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          name="chineseScore"
          label="语文成绩"
          rules={[
            {
              required: true,
              message: '请输入语文成绩！',
            },
          ]}
        />
        <ProFormText
          name="mathScore"
          label="数学成绩"
          rules={[
            {
              required: true,
              message: '请输入数学成绩！',
            },
          ]}
        />
        <ProFormText
          name="englishScore"
          label="英语成绩"
          rules={[
            {
              required: true,
              message: '请输入英语成绩！',
            },
          ]}
        />
      </ProForm.Group>
    </ModalForm>
  );
}
