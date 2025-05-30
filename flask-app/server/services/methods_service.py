import logging
from server.database import db
from server.models.methods_data import MethodsData
from server.models.user import User

logger = logging.getLogger(__name__)

def create_default_methods():
    """Create default methods in the database (idempotent)."""
    try:
        default_specs = [
            ("Klasifikácia", "Description for method 1", {}, False),
            ("Detekcia",     "Description for method 2", {}, False),
            ("Segmentácia",  "Description for method 3", {}, False),
        ]

        added = 0
        for name, desc, params, deletable in default_specs:
            # existuje už takáto metóda?
            exists = MethodsData.query.filter_by(name=name).first()
            if exists:
                logger.info("Method '%s' already exists – skipping", name)
                continue

            # nevznikla – pridáme
            db.session.add(
                MethodsData(name=name, description=desc, parameters=params, deletable=deletable)
            )
            added += 1

        if added:
            db.session.commit()
            logger.info("Added %d default method(s) to DB", added)
        else:
            logger.info("No new methods needed – all defaults present")

    except Exception as e:
        logger.exception("create_method_defaults: %s", e)
        db.session.rollback()

class MethodsService:
    def get_methods(self, user_id: int):
        """Get all methods from the database"""
        user = User.query.get(user_id)
        if not user or user.user_type not in ['super_admin', 'admin', 'doctor']:
            return {'error': 'Unauthorized'}, 403

        methods = MethodsData.query.all()
        result = []
        
        for method in methods:
            result.append({
                "id": method.id,
                "name": method.name,
                "description": method.description,
                "parameters": method.parameters,
                "created_at": method.created_at.isoformat() if method.created_at else None,
                "deletable": method.deletable,
            })
            
        return result, 200

    def get_method(self, user_id: int, method_id: int):
        """Get a specific method by ID"""
        user = User.query.get(user_id)
        if not user or user.user_type not in ['super_admin', 'admin', 'doctor']:
            return {'error': 'Unauthorized'}, 403

        method = MethodsData.query.get(method_id)
        if not method:
            return {'error': 'Method not found'}, 404

        result = {
            "id": method.id,
            "name": method.name,
            "description": method.description,
            "parameters": method.parameters,
            "created_at": method.created_at.isoformat() if method.created_at else None,
        }
        
        return result, 200

    def add_method(self, user_id: int, data):
        """Add a new method to the database"""
        user = User.query.get(user_id)
        if not user or user.user_type not in ['super_admin', 'admin']:
            return {'error': 'Unauthorized'}, 403

        try:
            name = data.get('name')
            description = data.get('description')
            parameters = data.get('parameters', {})

            if not name:
                return {'error': 'Name is required'}, 400

            # Check if method with the same name already exists
            existing_method = MethodsData.query.filter_by(name=name).first()
            if existing_method:
                return {'error': 'Method with this name already exists'}, 400

            new_method = MethodsData(
                name=name,
                description=description,
                parameters=parameters
            )
            
            db.session.add(new_method)
            db.session.commit()

            return {'message': 'Method added successfully', 'id': new_method.id}, 201

        except Exception as e:
            db.session.rollback()
            logger.exception("Error adding method: %s", e)
            return {'error': 'Internal server error'}, 500

    def update_method(self, user_id: int, method_id: int, data):
        """Update an existing method"""
        user = User.query.get(user_id)
        if not user or user.user_type not in ['super_admin', 'admin']:
            return {'error': 'Unauthorized'}, 403

        try:
            method = MethodsData.query.get(method_id)
            if not method:
                return {'error': 'Method not found'}, 404

            name = data.get('name')
            if name and name != method.name:
                # Check if another method with the new name exists
                existing_method = MethodsData.query.filter_by(name=name).first()
                if existing_method and existing_method.id != method_id:
                    return {'error': 'Method with this name already exists'}, 400
                method.name = name

            description = data.get('description')
            if description is not None:
                method.description = description

            parameters = data.get('parameters')
            if parameters is not None:
                method.parameters = parameters

            db.session.commit()
            return {'message': 'Method updated successfully'}, 200

        except Exception as e:
            db.session.rollback()
            logger.exception("Error updating method: %s", e)
            return {'error': 'Internal server error'}, 500

    def delete_method(self, user_id: int, method_id: int):
        """Delete a method from the database"""
        user = User.query.get(user_id)
        if not user or user.user_type not in ['super_admin']:
            return {'error': 'Unauthorized'}, 403

        try:
            method = MethodsData.query.get(method_id)
            if not method:
                return {'error': 'Method not found'}, 404

            if not method.deletable:
                return {'error': 'This method is protected and cannot be deleted.'}, 400

            db.session.delete(method)
            db.session.commit()
            return {'message': 'Method deleted successfully'}, 200

        except Exception as e:
            db.session.rollback()
            logger.exception("Error deleting method: %s", e)
            return {'error': 'Internal server error'}, 500

    def check_user_id(self, user_id: int):
        """Verify that the user exists and has permission to access methods"""
        try:
            user = User.query.get(user_id)
            if not user or user.user_type not in ['super_admin', 'admin', 'doctor']:
                return "User not found or no permission", 404
            return "OK", 200
        except Exception as e:
            logger.exception("Error checking user: %s", e)
            return f"Error checking user: {str(e)}", 500 
        
    def get_method_by_name(self, method_name: str):
        """Get a method by name"""
        method = MethodsData.query.filter_by(name=method_name).first()
        return method

    