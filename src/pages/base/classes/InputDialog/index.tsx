import {
  ModalForm,
  ProForm,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProFormDependency
} from '@ant-design/pro-components';
import {message} from 'antd';
import React, {useEffect, useRef} from 'react';
import {waitTime} from '@/utils/request';
import {addAClass, updateAClass} from '@/services/api/classes';

interface InputDialogProps {
  detailData?: API.ClassesDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

function numberToChinese(num: number): string {
  const chineseNumbers: string[] = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (num < 1 || num > 9) {
    return "0";
  }
  return chineseNumbers[num];
}

export default function InputDialog(props: InputDialogProps) {
  const form = useRef<ProFormInstance>(null);
  const yearArray: string[] = []
  const isSpring: number = new Date().getMonth()<8? 1:0;
  for (let i = new Date().getFullYear() - isSpring; i >= new Date().getFullYear() - isSpring - 5; i--) {
    yearArray.push(i.toString());
  }

  const defaultAcademicYear = props.detailData? Math.floor(props.detailData.id! / 100) : new Date().getFullYear() - isSpring;
  const defaultClassOrder = props.detailData? props.detailData.id! % 100 : undefined;

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
    const { attendanceYear, classOrder, chineseTeacher, mathTeacher, englishTeacher } = values;
    let id, className;
    const data: API.ClassesDTO = {
      id,
      className,
      chineseTeacher,
      mathTeacher,
      englishTeacher,
    };

    try {
      if (props.detailData) {
        data.id = props.detailData.id;
        data.className = props.detailData.className;
        await updateAClass(data, { throwError: true });
      } else {
        data.className = numberToChinese(new Date().getFullYear() - attendanceYear + 1 - isSpring) + '年级' + classOrder + '班';
        if(classOrder < 10) data.id = Number(String(attendanceYear) + '0' + String(classOrder));
        else data.id = Number(String(attendanceYear) + String(classOrder));
        await addAClass(data, { throwError: true });
      }
    } catch (ex) {
      return true;
    }
    props.onClose(true);
    message.success('您是最新的！');
    window.location.reload();
    return true;
  };

  return (
    <ModalForm
      width={500}
      onFinish={onFinish}
      formRef={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.onClose(false),
      }}
      title={props.detailData ? '修改 '+props.detailData.className : '新建班级'}
      open={props.visible}
    >
      <ProForm.Group>
        <ProFormSelect
          name="attendanceYear"
          width="xs"
          label="入学年份"
          rules={[
            {
              required: true,
              message: '请输入入学年份！',
            },
          ]}
          options={yearArray}
          initialValue={defaultAcademicYear}
          disabled={props.detailData !== undefined}
          showSearch
        />
        <ProFormDependency
          key="attendanceYear"
          name={['attendanceYear']}
          ignoreFormListField
        >
          {({ attendanceYear }) => {
            return (
              <ProFormText
                name={numberToChinese(new Date().getFullYear() - attendanceYear + 1 - isSpring) + '年级'}
                width="xs"
                label="年级(自动匹配)"
                rules={[
                  {
                    required: true,
                  },
                ]}
                disabled
                initialValue={numberToChinese(new Date().getFullYear() - attendanceYear + 1 - isSpring) + '年级'}
                fieldProps={{
                  placeholder: '',
                }}
              />
            );
          }}
        </ProFormDependency>
        <ProFormDigit
          name="classOrder"
          width="xs"
          label="年级内班级序号"
          rules={[
            {
              required: true,
              message: '请输入年级内班级序号！',
            },
          ]}
          min={1}
          max={99}
          initialValue={defaultClassOrder}
          disabled={props.detailData !== undefined}
          tooltip='本年级内的几班'
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          name="chineseTeacher"
          width="xs"
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
          width="xs"
          label="数学教师"
          rules={[
            {
              required: true,
              message: '请输入数学教师！',
            },
          ]}
        />
        <ProFormDependency
          key="attendanceYear"
          name={['attendanceYear']}
          ignoreFormListField
        >
          {({ attendanceYear }) => {
            return (
              <ProFormText
                name="englishTeacher"
                width="xs"
                label="英语教师"
                rules={[
                  {
                    required: new Date().getFullYear() - attendanceYear + 1 - isSpring >= 3,
                    message: '请输入英语教师！',
                  },
                ]}
                disabled={new Date().getFullYear() - attendanceYear + 1 - isSpring < 3}
                fieldProps={{
                  placeholder: new Date().getFullYear() - attendanceYear + 1 - isSpring < 3 ? '无': '请输入',
                }}
              />
            );
          }}
        </ProFormDependency>
      </ProForm.Group>
    </ModalForm>
  );
}
