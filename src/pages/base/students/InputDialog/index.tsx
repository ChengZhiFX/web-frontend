import { ModalForm, ProForm, ProFormInstance, ProFormText, ProFormSelect, } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef } from 'react';
import { waitTime } from '@/utils/request';
import { addAStudent, updateAStudent } from '@/services/api/students';

interface InputDialogProps {
  detailData?: API.StudentsDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

export default function InputDialog(props: InputDialogProps) {
  const form = useRef<ProFormInstance>(null);
  interface options{
    value: number,
    label: string,
  }
  const option:options[] =[{value:1,label:'男'},{value:0,label:'女'}]

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
    const { studentName, studentNum, gender, parentName, parentTel, classId } = values;
    //const id = parseInt(studentNum.slice(-4));
    const data: API.StudentsDTO = {
      id: props.detailData?.id,
      studentName,
      studentNum,
      gender,
      parentName,
      parentTel,
      classId,
    };

    try {
      if (props.detailData) {
        await updateAStudent(data, { throwError: true });
      } else {
        await addAStudent(data, { throwError: true });
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
      title={props.detailData ? '修改学生' : '新建学生'}
      open={props.visible}
    >
        <ProForm.Group>
          <ProFormText
            name="studentName"
            label="姓名"
            rules={[
              {
                required: true,
                message: '请输入学生姓名！',
              },
            ]}
          />
          <ProFormSelect
            name="gender"
            width="xs"
            label="性别"
            rules={[
              {
                required: true,
                message: '请选择性别！',
              },
            ]}
            options={option}
          />
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
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name="parentName" label="家长姓名" />
          <ProFormText name="parentTel" label="家长电话" />
        </ProForm.Group>
    </ModalForm>
  );
}
