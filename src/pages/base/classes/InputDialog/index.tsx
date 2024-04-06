import { ModalForm, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef } from 'react';
import { waitTime } from '@/utils/request';
import { addAClass, updateAClass } from '@/services/api/classes';

interface InputDialogProps {
  detailData?: API.ClassesDTO;
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
    const { className, chineseTeacher, mathTeacher, englishTeacher } = values;
    const data: API.ClassesDTO = {
      id: props.detailData?.id,
      className,
      chineseTeacher,
      mathTeacher,
      englishTeacher,
    };

    try {
      if (props.detailData) {
        await updateAClass(data, { throwError: true });
      } else {
        await addAClass(data, { throwError: true });
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
      title={props.detailData ? '修改班级' : '新建班级'}
      open={props.visible}
    >
      <ProForm.Group>
        <ProFormText
          name="id"
          label="班级号"
          rules={[
            {
              required: true,
              message: '请输入班级号！',
            },
          ]}
        />
        <ProFormText
          name="className"
          label="班级名称"
          rules={[
            {
              required: true,
              message: '请输入班级名称！',
            },
          ]}
        />
        <ProFormText
          name="chineseTeacher"
          label="语文教师"
          rules={[
            {
              required: true,
              message: '请输入语文教师！',
            },
          ]}
        />
        <ProFormText
          name="mathTeacher"
          label="数学教师"
          rules={[
            {
              required: true,
              message: '请输入数学教师！',
            },
          ]}
        />
        <ProFormText
          name="englishTeacher"
          label="英语教师"
          rules={[
            {
              required: true,
              message: '请输入英语教师！',
            },
          ]}
        />
      </ProForm.Group>
    </ModalForm>
  );
}
