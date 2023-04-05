import React,{useState,useEffect} from "react";
import axios from "axios";
import {Table, Popconfirm, Button,Space,Form,Input, message,} from "antd";
import {isEmpty, } from "lodash";


const DataTable = ()=>{ //Defining States
    const [gridData, setGridData]=useState([]);
    const [loading, setLoading] = useState(false);
    const [editRowKey, setEditRowKey] = useState("");
    const [sortedInfo, setSortedInfo] = useState({});
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [filteredInfo, setFilteredInfo] = useState({});
    let [filteredData] = useState();


    useEffect(()=>{
        loadData();
    },[])
    
    const addData = async () => { //Add new method
        try {
            
        const row = await form.validateFields();
       
        const newData = {
        id: modifiedData.length + 1,
        tasktitle: row.tasktitle,
        description: row.description,
        duedate: row.duedate,
        tag: row.tag,
        status: "OPEN",//Default Value
        key: modifiedData.length + 1,
        timestamp: Date(),
        };
     
        // Find the index where the new item should be inserted
        let insertIndex = modifiedData.length;
        for (let i = 0; i < modifiedData.length; i++) {
        const item = modifiedData[i];
        const sortOrder = sortedInfo.order === "descend" ? -1 : 1;
        if (item[sortedInfo.columnKey] > newData[sortedInfo.columnKey]) {
        insertIndex = i;
        break;
      }
    }



        // Insert the new item at the found index
    const newDataArray = [...modifiedData];
    newDataArray.splice(insertIndex, 0, newData);

    setGridData(newDataArray);
    form.resetFields();
    message.success("Data added successfully!");
  } catch (error) {
    console.log("error", error);
  }
};

        

    const loadData=async ()=>{
        setLoading(true);
        const response=await axios.get("https://todofakeapi.onrender.com/posts");
        const timestamp = Date();
        const updatedData = response.data.map((item) => ({ ...item, timestamp }));
        setGridData(updatedData);
        setLoading(false);
    }

    const dataWithAge = gridData.map((item) => ({
        ...item,
       
    }));
    const modifiedData=dataWithAge.map(({body, ...item})=>({
        ...item,
        key: item.id,
        description: isEmpty(body)?item.description:body,
    })); 
   
    console.log("modifiedData", modifiedData);

    const handleDelete = (value) => { //Delete Function
        const dataSource = [...modifiedData];
        const filteredData = dataSource.filter((item) => item.id !==value.id)
        setGridData(filteredData);
    }

    const isEditing = (record) => {  //Edit Function
        return record.key === editRowKey;
    }
 
    const cancel = () => {
        setEditRowKey("");
    };
    const save = async (key) => { //Save Function
        try {
            const row = await form.validateFields();
            const newData = [...modifiedData];
            const index = newData.findIndex((item)=>key === item.key);
            if(index > -1){
                const item = newData[index];
                newData.splice(index, 1, {...item, ...row});
                setGridData(newData);
                setEditRowKey("")
            }
        }catch(error){
            console.log("error",error)
        }
    };
    const edit = (record) => { //Edit Function
        form.setFieldsValue({
            tasktitle: "",
            description: "",
            duedate: "",
            ...record,
        }); 
        setEditRowKey(record.key);
    };

    const handleChange = (_, filter, sorter) =>{  //Sort and filter
        const {order, field} = sorter;
        setFilteredInfo(filter);
        setSortedInfo({columnkey: field, order});
    }

    
    

    const columns=[{  //Columns
        title: "ID",
        dataIndex: "id",
    },
    {
        title: "TimeStamp",
        dataIndex: "timestamp",
        align: "center",
        editTable: false,
        sorter: (a,b) => a.timestamp.length-b.timestamp.length,
        sortOrder: sortedInfo.columnkey === "timestamp" && sortedInfo.order,
    },
    {
        title: "Title",
        dataIndex: "tasktitle",
        align: "center",
        editTable: true,
        sorter: (a,b) => a.tasktitle.length-b.tasktitle.length,
        sortOrder: sortedInfo.columnkey === "tasktitle" && sortedInfo.order,
    
    },
    {
        title: "Description",
        dataIndex: "description",
        align: "center",
        editTable: true,
        sorter: (a,b) => a.description.length-b.description.length,
        sortOrder: sortedInfo.columnkey === "description" && sortedInfo.order,
    
    },
    {
        title: "Due Date",
        dataIndex: "duedate",
        align: "center",
        editTable: true,
        sorter: (a,b) => a.duedate.length-b.duedate.length,
        sortOrder: sortedInfo.columnkey === "duedate" && sortedInfo.order,
    },
    {
        title: "Tag",
        dataIndex: "tag",
        align: "center",
        editTable: true
    },
    {
        title: "Status",
        dataIndex: "status",
        align: "center",
        editTable: true,
    
        filters: [
            {text: "OPEN", value: "OPEN"},
            {text: "DONE", value: "DONE"},
            {text: "WORKING", value: "WORKING"},
            {text: "OVERDUE", value: "OVERDUE"},
            
        ],
        filteredValue: filteredInfo.status || null,
        onFilter: (value, record) => String(record.status).includes(value),
    },
    

    {
        title: "Action",
        dataIndex: "action",
        align: "center",
        render: (_, record) => {
         const editable = isEditing(record);   
        return modifiedData.length >=1 ? (
           <Space>
            <Popconfirm title="Do you really wanna delete?" 
            onConfirm={()=>handleDelete(record)}>
                <Button danger type="primary" disabled={editable}>
                    Delete
                </Button>
            </Popconfirm>
            {editable?(
                <span>
                    <Space size="middle">
                        <Button onClick={()=>save(record.key)} type="primary" style={{marginRight: 8}}>Save</Button>
                        <Popconfirm title="Do you really wanna cancel?" onConfirm={cancel} >
                        <Button>Cancel</Button>
                        </Popconfirm>
                    </Space>
                </span>
            ):(
            <Button onClick={()=>edit(record)} type="primary">
            Edit
            </Button>
         )}
            
            </Space>                
        ):null;
        }
    },   
    ];

    
    const mergedColumns = columns.map((col) => {
        if(!col.editTable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    const EditableCell = ({editing, dataIndex, title, record, children, ...restProps}) =>{
        const input = <Input/>;

        return (
            <td {...restProps}>
                {editing ?(
                    <Form.Item name={dataIndex} style={{margin: 0}} rules={[{
                        required: dataIndex === "tasktitle"||dataIndex === "description",
                        message: `Please input some value in ${title} field`,
                        max: 100 === "tasktitle",//max length 100 for title                        
                        max:1000 === "description",//max length 1000 for description
                        
                    }]}>  
                        {input}
                    </Form.Item>
                    
                ):(children)}
                
            </td>
        )
    }
   
    const reset = () =>{ //Reset Method
        setSortedInfo({});
        setFilteredInfo({});
        setSearchText("");
        loadData();
    }

    const handleInputChange = (e) => { //Search Method
        setSearchText(e.target.value);
        if(e.target.value === ""){
            loadData();
        }
    }

    const globalSearch = () =>{    //Search Function
        filteredData = modifiedData.filter((value) => {
            return (
                value.tasktitle.toLowerCase().includes(searchText.toLowerCase()) ||
                value.description.toLowerCase().includes(searchText.toLowerCase())||
                value.duedate.toLowerCase().includes(searchText.toLowerCase())|| 
                value.tag.toLowerCase().includes(searchText.toLowerCase())||
                value.status.toLowerCase().includes(searchText.toLowerCase())  

            )
        })
        setGridData(filteredData);
    }


    return (
    
    <div>
        <h1>AlgoBulls To-Do List App</h1>
        <Space style={{marginTop: 16,marginBottom: 16}}>
            <Input
            placeholder="Enter Search Text"
            onChange={handleInputChange}
            type="text"
            allowClear
            value={searchText}
            />
        <Button onClick={globalSearch} type="primary">Search</Button>    
        <Button onClick={reset}>Reset</Button>
        <Button type="primary" onClick={() => addData()}>Add New</Button> 
        </Space>
        <Form form={form} component={false}>
        <Table
        columns={mergedColumns}
        components={{
            body:{ cell:EditableCell,}
        }}
        dataSource={filteredData && filteredData.length ? filteredData:modifiedData }
        bordered
        loading={loading}
        onChange={handleChange}
        />
        </Form>
    </div>
    ); 
}

export default DataTable