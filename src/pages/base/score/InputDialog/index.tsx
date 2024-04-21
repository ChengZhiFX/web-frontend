import {ModalForm, ProForm, ProFormInstance, ProFormSelect, ProFormText, ProFormDependency } from '@ant-design/pro-components';
import {Input, message} from 'antd';
import React, { useEffect, useRef } from 'react';
import { waitTime } from '@/utils/request';
import {addAScore, listScores, updateAScore} from '@/services/api/score';
import { listStudentsMaps } from '@/services/api/students';

interface InputDialogProps {
  detailData?: API.ScoreDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

interface options{
  value: number,
  label: string,
}

export const studentsRecord = await listStudentsMaps();

export default function InputDialog(props: InputDialogProps) {
  const form = useRef<ProFormInstance>(null);
  const option:options[] =[{value:1,label:'秋季'},{value:2,label:'春季'}]
  const isSpring: number = new Date().getMonth()<8? 1:0;
  const defaultAcademicYear = new Date().getFullYear() - isSpring;
  const defaultSemester = isSpring + 1;

  const studentsNumOption:options[] = []
  const studentsNameOption:options[] = []
  studentsRecord!.forEach((item: any, index: number)=>{
    studentsNumOption.push({value: studentsRecord![index].student_num,label:studentsRecord![index].student_num});
  })
  studentsRecord!.forEach((item: any, index: number)=>{
    studentsNameOption.push({value: studentsRecord![index].student_name,label:studentsRecord![index].student_name});
  })

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
    let scoreId= (props.detailData?.academicYear && props.detailData?.semester)? props.detailData?.id : undefined;
    const data: API.ScoreDTO = {
      id: scoreId,
      studentNum,
      chineseScore,
      mathScore,
      englishScore,
      academicYear,
      semester,
      classId,
    };

    try {
      if (props.detailData?.academicYear && props.detailData?.semester) {
        await updateAScore(data, { throwError: true });
      } else {
        await addAScore(data, { throwError: true });
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
      title={(props.detailData?.academicYear && props.detailData?.semester) ? '修改成绩' : '新建成绩'}
      open={props.visible}
    >
      <ProForm.Group>
        <ProFormSelect
          name="studentNum"
          label="学号"
          width='sm'
          rules={[
            {
              required: true,
              message: '请输入学号',
            },
          ]}
          disabled={props.detailData !== undefined}
          options={studentsNumOption}
          showSearch
          fieldProps={{
            placeholder: '必填',
          }}
        />
        <ProFormDependency
          key="studentNum"
          name={['studentNum']}
          ignoreFormListField
        >
          {({ studentNum }) => {
            let studentName;
            studentsRecord?.forEach((item: any, index: number)=>{
              if(studentsRecord![index].student_num === studentNum)
                studentName = studentsRecord![index].student_name});
            return (
              <ProFormText
                width="xs"
                name={studentName}
                label="姓名(自动匹配)"
                disabled
                initialValue={studentName}
                fieldProps={{
                  placeholder: '',
                }}
              />
            );
          }}
        </ProFormDependency>
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDependency
          key="studentNum"
          name={['studentNum']}
          ignoreFormListField
        >
          {({ studentNum }) => {
            const yearArray: string[] = []
            for (let i = new Date().getFullYear() - isSpring; i >= Math.floor(studentNum / 1000000); i--) {
              yearArray.push(i.toString());
            }
            return (
              <ProFormSelect
                name="academicYear"
                width="xs"
                label="学年"
                rules={[
                  {
                    required: true,
                    message: '请输入学年！',
                  },
                ]}
                initialValue={defaultAcademicYear}
                options={yearArray}
                disabled={(props.detailData?.academicYear && props.detailData?.semester) !== undefined}
                showSearch
                fieldProps={{
                  placeholder: '必填',
                }}
              />
            );
          }}
        </ProFormDependency>
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
          initialValue={defaultSemester}
          disabled={(props.detailData?.academicYear && props.detailData?.semester) !== undefined}
          fieldProps={{
            placeholder: '必填',
          }}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          name="chineseScore"
          width="xs"
          label="语文成绩"
          rules={[
            () => ({
              validator(_, value) {
                if (value === undefined || value === null || (value <= 100 && value >= 0)) {
                  return Promise.resolve();
                }
                else {
                  return Promise.reject(new Error("请输入0~100之间的数值"));
                }
              },
              required: false,
            }),
          ]}
          tooltip='留空则默认为0'
        />
        <ProFormText
          name="mathScore"
          width="xs"
          label="数学成绩"
          rules={[
            () => ({
              validator(_, value) {
                if (value === undefined || value === null || (value <= 100 && value >= 0)) {
                  return Promise.resolve();
                }
                else {
                  return Promise.reject(new Error("请输入0~100之间的数值"));
                }
              },
              required: false,
            }),
          ]}
          tooltip='留空则默认为0'
        />
        <ProFormDependency
          key="studentNum"
          name={['studentNum']}
          ignoreFormListField
        >
          {({ studentNum }) => {
            return (
              <ProFormText
                name="englishScore"
                width="xs"
                label="英语成绩"
                rules={[
                  () => ({
                    validator(_, value) {
                      if (value === undefined || value === null || (value <= 100 && value >= 0)) {
                        return Promise.resolve();
                      }
                      else {
                        return Promise.reject(new Error("请输入0~100之间的数值"));
                      }
                    },
                    required: false,
                  }),
                ]}
                disabled={new Date().getFullYear() - Math.floor(studentNum / 1000000) + 1 - isSpring < 3}
                fieldProps={{
                  placeholder: new Date().getFullYear() - Math.floor(studentNum / 1000000) + 1 - isSpring < 3 ? '无': '请输入',
                }}
                tooltip='留空则默认为0'
              />
            );
          }}
        </ProFormDependency>
      </ProForm.Group>
    </ModalForm>
  );
}
