import {ModalForm, ProForm, ProFormInstance, ProFormSelect, ProFormText, ProFormDependency } from '@ant-design/pro-components';
import {Input, message} from 'antd';
import { useEffect, useRef } from 'react';
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
  const yearArray: string[] = []
  const isSpring: number = new Date().getMonth()<8? 1:0;
  for (let i = new Date().getFullYear() - isSpring; i >= new Date().getFullYear() - isSpring - 5; i--) {
    yearArray.push(i.toString());
  }
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
        // if(false){
        //   await listScores(data);
        //   message.error('!');
        //   return true;
        // }
        await addAScore(data, { throwError: true });
      }
    } catch (ex) {
      return true;
    }

    props.onClose(true);
    message.success('您是最新的！');
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
            placeholder: '请输入或选择',
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
                label="对应学生姓名"
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
          initialValue={defaultSemester}
          disabled={(props.detailData?.academicYear && props.detailData?.semester) !== undefined}
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
          width="xs"
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
          width="xs"
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
