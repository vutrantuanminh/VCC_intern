package aimsfinal.DAO;

import aimsfinal.Model.RushOrder;
import java.sql.*;
import java.util.List;
import java.util.ArrayList;

public class RushOrderDAO {
    
    public RushOrderDAO() {}
    
    public boolean createRushOrder(RushOrder rushOrder) throws SQLException {
        // TODO: Implement create rush order
        return true;
    }
    
    public List<RushOrder> getByUserId(int userId) throws SQLException {
        // TODO: Implement get by user id
        return new ArrayList<>();
    }
    
    public RushOrder getById(int id) throws SQLException {
        // TODO: Implement get by id
        return null;
    }
    
    public List<RushOrder> getAll() throws SQLException {
        // TODO: Implement get all
        return new ArrayList<>();
    }
    
    public boolean update(RushOrder rushOrder) throws SQLException {
        // TODO: Implement update
        return true;
    }
    
    public boolean delete(int id) throws SQLException {
        // TODO: Implement delete
        return true;
    }
} 