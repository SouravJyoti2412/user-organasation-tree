import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tree from 'react-d3-tree'; // Tree library for visualization
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Add any custom styles

const formatTreeData = (data) => {
  const formatPerson = (person) => ({
    name: person.name,
    attributes: {
      id: person.id,
    },
    children: person.children?.map(formatPerson) || [],
  });
  return formatPerson(data);
};

const OrgTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [name, setName] = useState('');
  const [currentId, setCurrentId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isParentAdd, setParentAdd] = useState(false);

  useEffect(() => {
    fetchData();

    // Handle window resize to keep the tree centered
    const handleResize = () => setTreeData(prevData => ({ ...prevData }));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/persons/1/');
      setTreeData(formatTreeData(response.data));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleEdit = (id) => {
    setCurrentId(id);
    setIsEditing(true);
    const person = findPersonById(treeData, id);
    if (person) setName(person.name);
  };

  const handleDelete = (id , name) => {
    if (window.confirm(`Are you sure you want to delete person name: ${name}?`)) {
      axios.delete(`http://127.0.0.1:8000/api/persons/${id}/`)
        .then(() => {
          fetchData();
          console.log(`Deleted person name: ${name}`);
        })
        .catch(error => {
          console.error('Error deleting person:', error);
        });
    }
  };

  const handleAdd = (parentId) => {
    setCurrentId(parentId);
    setIsEditing(true);
    setParentAdd(true);
    setName(''); // Reset name for new person
  };

  const findPersonById = (data, id) => {
    if (data.attributes.id === id) return data;
    for (let child of data.children) {
      const result = findPersonById(child, id);
      if (result) return result;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      if (currentId) {
        console.log(currentId);
        if (currentId === 'new') {
          await axios.post(`http://127.0.0.1:8000/api/persons/`, { name });
        } else {
          if (!isParentAdd) {
            await axios.put(`http://127.0.0.1:8000/api/persons/${currentId}/`, { name });
          } else {
            await axios.post(`http://127.0.0.1:8000/api/persons-add-in-parent/`, { name, parent: currentId });
            setParentAdd(false);
          }
        }
      }
      fetchData();
      setIsEditing(false);
      setName('');
      setCurrentId(null);
    }
  };

  if (!treeData) {
    return <div>Loading...</div>;
  }

  const renderPersonNode = ({ nodeDatum, toggleNode }) => (
    <g>
      <circle r="30"></circle>
      <text fill="black" strokeWidth="1" x="0" y="5" textAnchor="middle" dominantBaseline="middle">
        {nodeDatum.name}
      </text>
      <foreignObject x="-80" y="20" width="200" height="100">
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1px', marginLeft: '20px', marginTop: "10px", position: 'relative', zIndex: '5555' }}>
          <button className='button' onClick={() => handleEdit(nodeDatum.attributes.id)}>Edit</button>
          <button onClick={() => handleDelete(nodeDatum.attributes.id ,nodeDatum.name )}>Delete</button>
          <button onClick={() => handleAdd(nodeDatum.attributes.id)}>Add</button>
        </div>
      </foreignObject>
    </g>
  );

  return (
    <div
      id="treeWrapper"

    >
      <Tree 
    data={treeData}
    renderCustomNodeElement={renderPersonNode}
    orientation="vertical"
    translate={{ x: 500, y: 50 }}
    scaleExtent={{ min: 0.5, max: 2 }} // Allow zooming in/out
    zoom={0.8} // Set initial zoom
      />
      {isEditing && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{currentId ? "Edit Person" : "Add Person"}</h5>
                <button type="button" className="btn-close" onClick={() => setIsEditing(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgTree;
