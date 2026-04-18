from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import sqlite3
import json
import os
from datetime import datetime, date, timedelta
from enum import Enum
import jwt
import hashlib

app = FastAPI(title="Academy of Creativity API", version="2.0.0")

# إعداد CORS للسماح بالوصول من الواجهة الأمامية
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# تقديم الملفات الثابتة
app.mount("/assets", StaticFiles(directory="../frontend/academy-frontend/src/assets"), name="assets")

# قاعدة البيانات المحلية
DATABASE_URL = "academy.db"

def get_db():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # إنشاء جداول قاعدة البيانات
    
    # جدول الأكاديمية
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS academy_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            address TEXT,
            phone TEXT,
            email TEXT,
            website TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول الفروع
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS branch_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            academy_id INTEGER,
            name TEXT NOT NULL,
            address TEXT,
            phone TEXT,
            email TEXT,
            governorate_id INTEGER,
            city_id INTEGER,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (academy_id) REFERENCES academy_data (id)
        )
    """)
    
    # جدول المحافظات
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS governorate_code (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            code TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول المدن
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS city_code (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            governorate_id INTEGER,
            code TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (governorate_id) REFERENCES governorate_code (id)
        )
    """)
    
    # جدول الدول
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS country_code (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            code TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول الفئات الرئيسية للدورات
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS academy_clase_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول أنواع الدورات
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS academy_clase_type (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول تفاصيل الدورات
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS academy_clase_detail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            master_id INTEGER,
            type_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            duration INTEGER,
            price REAL,
            image_url TEXT,
            start_date DATE,
            end_date DATE,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (master_id) REFERENCES academy_clase_master (id),
            FOREIGN KEY (type_id) REFERENCES academy_clase_type (id)
        )
    """)
    
    # جدول البرامج
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS programs_content_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name2 TEXT,
            description TEXT,
            duration INTEGER,
            level TEXT,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Add name2 column if it doesn't exist (for existing tables)
    try:
        cursor.execute("""
            ALTER TABLE programs_content_master 
            ADD COLUMN name2 TEXT
        """)
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("✅ Column name2 already exists in programs_content_master")
        else:
            print(f"❌ Error adding name2 column: {e}")
    
    # جدول تفاصيل البرامج
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS programs_content_detail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            program_id INTEGER,
            title TEXT NOT NULL,
            content TEXT,
            session_video TEXT,
            order_index INTEGER,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (program_id) REFERENCES programs_content_master (id)
        )
    """)
    
    # Add session_video column if it doesn't exist (for existing tables)
    try:
        cursor.execute("""
            ALTER TABLE programs_content_detail 
            ADD COLUMN session_video TEXT
        """)
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("✅ Column session_video already exists in programs_content_detail")
        else:
            print(f"❌ Error adding session_video column: {e}")
    
    # جدول المشاريع
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            status TEXT DEFAULT 'pending',
            start_date DATE,
            end_date DATE,
            image_url TEXT,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول تفاصيل المشاريع
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects_detail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            title TEXT NOT NULL,
            content TEXT,
            order_index INTEGER,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects_master (id)
        )
    """)
    
    # جدول تطوير المهارات
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS skill_development (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            level TEXT,
            duration INTEGER,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول المعلمين
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS teacher_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            specialization TEXT,
            experience_years INTEGER,
            bio TEXT,
            image_url TEXT,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول الطلاب
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            address TEXT,
            birth_date DATE,
            enrollment_date DATE,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول الوظائف
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS academy_job (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            requirements TEXT,
            salary_range TEXT,
            location TEXT,
            type TEXT,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول الحضور
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_attend (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            course_id INTEGER,
            attendance_date DATE,
            status TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES student_data (id),
            FOREIGN KEY (course_id) REFERENCES academy_clase_detail (id)
        )
    """)
    
    # جدول التقييمات
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_evaluation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            course_id INTEGER,
            evaluation_date DATE,
            score REAL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES student_data (id),
            FOREIGN KEY (course_id) REFERENCES academy_clase_detail (id)
        )
    """)
    
    # جدول مجموعات الطلاب
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_group (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            course_id INTEGER,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES academy_clase_detail (id)
        )
    """)
    
    # جدول الشكاوى
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints_student (
            id TEXT PRIMARY KEY,
            student_id INTEGER,
            complaint_type_id INTEGER,
            status_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES student_data (id),
            FOREIGN KEY (complaint_type_id) REFERENCES complaints_type (id),
            FOREIGN KEY (status_id) REFERENCES complaints_status (id)
        )
    """)
    
    # جدول أنواع الشكاوى
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints_type (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول حالات الشكاوى
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول الدردشة
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER,
            receiver_id INTEGER,
            message TEXT NOT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            read_at TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES student_data (id),
            FOREIGN KEY (receiver_id) REFERENCES student_data (id)
        )
    """)
    
    # جدول بنك الأسئلة
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS question_bank_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subject TEXT,
            difficulty TEXT,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # جدول تفاصيل الأسئلة
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS question_bank_detail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER,
            question_text TEXT NOT NULL,
            options TEXT,
            correct_answer TEXT,
            points INTEGER DEFAULT 1,
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES question_bank_master (id)
        )
    """)
    
    conn.commit()
    conn.close()

# Local data access functions
def get_all_courses():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT d.*, m.name as master_name, t.name as type_name 
        FROM academy_clase_detail d
        LEFT JOIN academy_clase_master m ON d.master_id = m.id
        LEFT JOIN academy_clase_type t ON d.type_id = t.id
        WHERE d.active = 1
    """)
    courses = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return courses

def get_course_by_id(course_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT d.*, m.name as master_name, t.name as type_name 
        FROM academy_clase_detail d
        LEFT JOIN academy_clase_master m ON d.master_id = m.id
        LEFT JOIN academy_clase_type t ON d.type_id = t.id
        WHERE d.id = ? AND d.active = 1
    """, (course_id,))
    course = cursor.fetchone()
    conn.close()
    return dict(course) if course else None

def get_all_course_masters():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM academy_clase_master WHERE active = 1")
    masters = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return masters

def get_course_master_by_id(master_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM academy_clase_master WHERE id = ? AND active = 1", (master_id,))
    master = cursor.fetchone()
    conn.close()
    return dict(master) if master else None

def get_all_course_types():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM academy_clase_type WHERE active = 1")
    types = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return types

def get_academy_data():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM academy_data")
    data = cursor.fetchall()
    conn.close()
    return [dict(row) for row in data]

def get_all_jobs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM academy_job WHERE active = 1")
    jobs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jobs

def get_all_branches():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.*, g.name as governorate_name, c.name as city_name
        FROM branch_data b
        LEFT JOIN governorate_code g ON b.governorate_id = g.id
        LEFT JOIN city_code c ON b.city_id = c.id
        WHERE b.active = 1
    """)
    branches = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return branches

def get_all_programs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM programs_content_master WHERE active = 1")
    programs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return programs

def create_program_content_master(session_name_l1: str, session_name_l2: str, description: str):
    """Create new program content master in database"""
    try:
        print(f"🔧 Database save called with: name='{session_name_l1}', name2='{session_name_l2}', description='{description}'")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Insert new program using correct table structure
        cursor.execute("""
            INSERT INTO programs_content_master 
            (name, name2, description, active, created_at)
            VALUES (?, ?, ?, 1, ?)
        """, (session_name_l1, session_name_l2, description, datetime.now().isoformat()))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get the created program
        cursor.execute("SELECT * FROM programs_content_master WHERE rowid = last_insert_rowid()")
        program = cursor.fetchone()
        conn.close()
        
        if program:
            result = dict(program)
            print(f"✅ Retrieved created program: {result}")
            return result
        else:
            print("❌ No program retrieved after insert")
            return None
            
    except Exception as e:
        print(f"❌ Database error in create_program_content_master: {str(e)}")
        return None

def update_program_content_master(program_id: int, session_name_l1: str, session_name_l2: str, description: str):
    """Update program content master in database"""
    try:
        print(f"Database update called with: ID={program_id}, name='{session_name_l1}', name2='{session_name_l2}', description='{description}'")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Update existing program
        cursor.execute("""
            UPDATE programs_content_master 
            SET name = ?, name2 = ?, description = ?
            WHERE id = ? AND active = 1
        """, (session_name_l1, session_name_l2, description, program_id))
        
        conn.commit()
        
        # Check if any row was affected
        rows_affected = cursor.rowcount
        
        if rows_affected > 0:
            # Get the updated program
            cursor.execute("SELECT * FROM programs_content_master WHERE id = ? AND active = 1", (program_id,))
            program = cursor.fetchone()
            conn.close()
            
            if program:
                result = dict(program)
                print(f"Program {program_id} updated successfully: {result}")
                return result
            else:
                print(f"Program {program_id} not found after update")
                return None
        else:
            print(f"Program {program_id} not found")
            conn.close()
            return None
            
    except Exception as e:
        print(f"Database error in update_program_content_master: {str(e)}")
        return None

def delete_program_content_master(program_id: int):
    """Delete program content master from database"""
    try:
        print(f"Database delete called with ID: {program_id}")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Soft delete by setting active to 0
        cursor.execute("""
            UPDATE programs_content_master 
            SET active = 0
            WHERE id = ?
        """, (program_id,))
        
        conn.commit()
        
        # Check if any row was affected
        rows_affected = cursor.rowcount
        conn.close()
        
        if rows_affected > 0:
            print(f"Program {program_id} soft deleted successfully")
            return True
        else:
            print(f"Program {program_id} not found")
            return False
            
    except Exception as e:
        print(f"Database error in delete_program_content_master: {str(e)}")
        return False

def create_program_content_detail(program_id: int, title: str, content: str, session_video: str = None):
    """Create new program content detail in database"""
    try:
        print(f"Database save called with: program_id={program_id}, title='{title}', content='{content}', session_video='{session_video}'")
        print(f"🔧 Database save called with: program_id={program_id}, title='{title}', content='{content}', session_video='{session_video}'")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Get next order_index
        cursor.execute("SELECT MAX(order_index) FROM programs_content_detail WHERE program_id = ? AND active = 1", (program_id,))
        max_order = cursor.fetchone()[0]
        next_order = (max_order or 0) + 1
        
        # Insert new program detail
        cursor.execute("""
            INSERT INTO programs_content_detail 
            (program_id, title, content, session_video, order_index, active, created_at)
            VALUES (?, ?, ?, ?, ?, 1, ?)
        """, (program_id, title, content, session_video, next_order, datetime.now().isoformat()))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get the created program detail
        cursor.execute("SELECT * FROM programs_content_detail WHERE rowid = last_insert_rowid()")
        program_detail = cursor.fetchone()
        conn.close()
        
        if program_detail:
            result = dict(program_detail)
            print(f"✅ Retrieved created program detail: {result}")
            return result
        else:
            print("❌ No program detail retrieved after insert")
            return None
            
    except Exception as e:
        print(f"❌ Database error in create_program_content_detail: {str(e)}")
        return None

def delete_program_content_detail(detail_id: int):
    """Delete program content detail from database"""
    try:
        print(f"🔧 Database delete called with detail ID: {detail_id}")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Soft delete by setting active to 0
        cursor.execute("""
            UPDATE programs_content_detail 
            SET active = 0
            WHERE id = ?
        """, (detail_id,))
        
        conn.commit()
        
        # Check if any row was affected
        rows_affected = cursor.rowcount
        conn.close()
        
        if rows_affected > 0:
            print(f"✅ Program detail {detail_id} soft deleted successfully")
            return True
        else:
            print(f"❌ Program detail {detail_id} not found")
            return False
            
    except Exception as e:
        print(f"❌ Database error in delete_program_content_detail: {str(e)}")
        return False

def get_program_by_id(program_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM programs_content_master WHERE id = ? AND active = 1", (program_id,))
    program = cursor.fetchone()
    conn.close()
    return dict(program) if program else None

def get_all_program_details():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT pd.*, pm.name as program_name
        FROM programs_content_detail pd
        LEFT JOIN programs_content_master pm ON pd.program_id = pm.id
        WHERE pd.active = 1
    """)
    details = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return details

def get_all_projects():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects_master WHERE active = 1")
    projects = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return projects

def get_project_by_id(project_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects_master WHERE id = ? AND active = 1", (project_id,))
    project = cursor.fetchone()
    conn.close()
    return dict(project) if project else None

def get_all_project_details():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT pd.*, pm.name as project_name
        FROM projects_detail pd
        LEFT JOIN projects_master pm ON pd.project_id = pm.id
        WHERE pd.active = 1
    """)
    details = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return details

def get_all_skill_development():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM skill_development WHERE active = 1")
    skills = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return skills

def get_all_students():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student_data WHERE active = 1")
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return students

def get_student_by_id(student_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student_data WHERE id = ? AND active = 1", (student_id,))
    student = cursor.fetchone()
    conn.close()
    return dict(student) if student else None

def get_all_teachers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM teacher_data WHERE active = 1")
    teachers = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return teachers

def get_teacher_by_id(teacher_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM teacher_data WHERE id = ? AND active = 1", (teacher_id,))
    teacher = cursor.fetchone()
    conn.close()
    return dict(teacher) if teacher else None

def get_all_question_bank():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM question_bank_master WHERE active = 1")
    questions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return questions

def get_all_question_details():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT qd.*, qm.title as question_title
        FROM question_bank_detail qd
        LEFT JOIN question_bank_master qm ON qd.question_id = qm.id
        WHERE qd.active = 1
    """)
    details = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return details

def get_all_complaints():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.*, s.name as student_name, ct.name as complaint_type_name, cs.name as status_name
        FROM complaints_student c
        LEFT JOIN student_data s ON c.student_id = s.id
        LEFT JOIN complaints_type ct ON c.complaint_type_id = ct.id
        LEFT JOIN complaints_status cs ON c.status_id = cs.id
    """)
    complaints = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return complaints

def get_complaint_by_id(complaint_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.*, s.name as student_name, ct.name as complaint_type_name, cs.name as status_name
        FROM complaints_student c
        LEFT JOIN student_data s ON c.student_id = s.id
        LEFT JOIN complaints_type ct ON c.complaint_type_id = ct.id
        LEFT JOIN complaints_status cs ON c.status_id = cs.id
        WHERE c.id = ?
    """, (complaint_id,))
    complaint = cursor.fetchone()
    conn.close()
    return dict(complaint) if complaint else None

def create_complaint_local(complaint_data: dict):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO complaints_student (id, student_id, complaint_type_id, status_id, title, description)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        complaint_data.get('id'),
        complaint_data.get('student_id'),
        complaint_data.get('complaint_type_id'),
        complaint_data.get('status_id', 1),
        complaint_data.get('title'),
        complaint_data.get('description')
    ))
    conn.commit()
    complaint_id = cursor.lastrowid
    conn.close()
    return {"id": complaint_id, **complaint_data}

def get_all_complaint_types():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints_type WHERE active = 1")
    types = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return types

def get_complaint_type_by_id(type_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints_type WHERE id = ? AND active = 1", (type_id,))
    complaint_type = cursor.fetchone()
    conn.close()
    return dict(complaint_type) if complaint_type else None

def get_all_complaint_status():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints_status WHERE active = 1")
    status_list = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return status_list

def get_complaint_status_by_id(status_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints_status WHERE id = ? AND active = 1", (status_id,))
    status = cursor.fetchone()
    conn.close()
    return dict(status) if status else None

def get_all_countries():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM country_code")
    countries = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return countries

def get_all_governorates():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM governorate_code")
    governorates = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return governorates

def get_all_cities():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.*, g.name as governorate_name
        FROM city_code c
        LEFT JOIN governorate_code g ON c.governorate_id = g.id
    """)
    cities = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return cities

def get_all_attendance():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, s.name as student_name, c.name as course_name
        FROM student_attend a
        LEFT JOIN student_data s ON a.student_id = s.id
        LEFT JOIN academy_clase_detail c ON a.course_id = c.id
    """)
    attendance = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return attendance

def get_all_evaluations():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT e.*, s.name as student_name, c.name as course_name
        FROM student_evaluation e
        LEFT JOIN student_data s ON e.student_id = s.id
        LEFT JOIN academy_clase_detail c ON e.course_id = c.id
    """)
    evaluations = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return evaluations

def get_all_student_groups():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT sg.*, c.name as course_name
        FROM student_group sg
        LEFT JOIN academy_clase_detail c ON sg.course_id = c.id
        WHERE sg.active = 1
    """)
    groups = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return groups

def get_all_chat_messages():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.*, s.name as sender_name, r.name as receiver_name
        FROM chat c
        LEFT JOIN student_data s ON c.sender_id = s.id
        LEFT JOIN student_data r ON c.receiver_id = r.id
    """)
    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return messages

# تهيئة قاعدة البيانات عند بدء التشغيل
init_db()

# Seed sample data for testing
def seed_sample_data():
    conn = get_db()
    cursor = conn.cursor()
    
    # Seed academy data
    cursor.execute("INSERT OR IGNORE INTO academy_data (id, name, description, address, phone, email, website) VALUES (1, 'أكاديمية الإبداع', 'أكاديمية متخصصة في تطوير المهارات والإبداع', 'الرياض، المملكة العربية السعودية', '+966501234567', 'info@creativity-academy.com', 'https://creativity-academy.com')")
    
    # Seed course masters
    cursor.execute("INSERT OR IGNORE INTO academy_clase_master (id, name, description) VALUES (1, 'البرمجة', 'دورات في لغات البرمجة المختلفة')")
    cursor.execute("INSERT OR IGNORE INTO academy_clase_master (id, name, description) VALUES (2, 'التصميم', 'دورات في التصميم الجرافيكي وواجهة المستخدم')")
    cursor.execute("INSERT OR IGNORE INTO academy_clase_master (id, name, description) VALUES (3, 'اللغات', 'دورات في تعلم اللغات الأجنبية')")
    
    # Seed course types
    cursor.execute("INSERT OR IGNORE INTO academy_clase_type (id, name, description) VALUES (1, 'عن بعد', 'دورات تقدم عبر الإنترنت')")
    cursor.execute("INSERT OR IGNORE INTO academy_clase_type (id, name, description) VALUES (2, 'حضوري', 'دورات تقدم في مقر الأكاديمية')")
    
    # Seed sample courses
    cursor.execute("INSERT OR IGNORE INTO academy_clase_detail (id, master_id, type_id, name, description, duration, price, start_date, end_date) VALUES (1, 1, 1, 'مقدمة في بايثون', 'دورة أساسية في لغة بايثون للمبتدئين', 30, 1500.0, '2024-01-01', '2024-01-30')")
    cursor.execute("INSERT OR IGNORE INTO academy_clase_detail (id, master_id, type_id, name, description, duration, price, start_date, end_date) VALUES (2, 2, 2, 'التصميم الجرافيكي', 'دورة في أساسيات التصميم الجرافيكي', 45, 2000.0, '2024-02-01', '2024-03-15')")
    
    # Seed governorates
    cursor.execute("INSERT OR IGNORE INTO governorate_code (id, name, code) VALUES (1, 'الرياض', '01')")
    cursor.execute("INSERT OR IGNORE INTO governorate_code (id, name, code) VALUES (2, 'جدة', '02')")
    cursor.execute("INSERT OR IGNORE INTO governorate_code (id, name, code) VALUES (3, 'مكة المكرمة', '03')")
    
    # Seed cities
    cursor.execute("INSERT OR IGNORE INTO city_code (id, name, governorate_id, code) VALUES (1, 'الرياض', 1, '001')")
    cursor.execute("INSERT OR IGNORE INTO city_code (id, name, governorate_id, code) VALUES (2, 'جدة', 2, '002')")
    cursor.execute("INSERT OR IGNORE INTO city_code (id, name, governorate_id, code) VALUES (3, 'مكة المكرمة', 3, '003')")
    
    # Seed branches
    cursor.execute("INSERT OR IGNORE INTO branch_data (id, academy_id, name, address, phone, email, governorate_id, city_id) VALUES (1, 1, 'فرع الرياض', 'الرياض، حي النخيل', '+966501234568', 'riyadh@creativity-academy.com', 1, 1)")
    cursor.execute("INSERT OR IGNORE INTO branch_data (id, academy_id, name, address, phone, email, governorate_id, city_id) VALUES (2, 1, 'فرع جدة', 'جدة، حي الروضة', '+966501234569', 'jeddah@creativity-academy.com', 2, 2)")
    
    # Seed teachers
    cursor.execute("INSERT OR IGNORE INTO teacher_data (id, name, email, phone, specialization, experience_years, bio) VALUES (1, 'أحمد محمد', 'ahmed@creativity-academy.com', '+966501234570', 'البرمجة', 5, 'مطور برامج محترف بخبرة 5 سنوات')")
    cursor.execute("INSERT OR IGNORE INTO teacher_data (id, name, email, phone, specialization, experience_years, bio) VALUES (2, 'فاطمة علي', 'fatima@creativity-academy.com', '+966501234571', 'التصميم', 7, 'مصممة جرافيك محترفة بخبرة 7 سنوات')")
    
    # Seed students
    cursor.execute("INSERT OR IGNORE INTO student_data (id, name, email, phone, address, enrollment_date) VALUES (1, 'محمد عبدالله', 'mohammed@student.com', '+966511234570', 'الرياض', '2024-01-01')")
    cursor.execute("INSERT OR IGNORE INTO student_data (id, name, email, phone, address, enrollment_date) VALUES (2, 'نورة سعد', 'nora@student.com', '+966511234571', 'جدة', '2024-01-15')")
    
    # Seed complaint types
    cursor.execute("INSERT OR IGNORE INTO complaints_type (id, name, description) VALUES (1, 'شكوى أكاديمية', 'شكاوى متعلقة بالدورات والمحتوى الأكاديمي')")
    cursor.execute("INSERT OR IGNORE INTO complaints_type (id, name, description) VALUES (2, 'شكوى مالية', 'شكاوى متعلقة بالرسوم والدفع')")
    cursor.execute("INSERT OR IGNORE INTO complaints_type (id, name, description) VALUES (3, 'شكوى فنية', 'شكاوى متعلقة بالمنصة التقنية')")
    
    # Seed complaint status
    cursor.execute("INSERT OR IGNORE INTO complaints_status (id, name, description) VALUES (1, 'مفتوحة', 'الشكوى تم استلامها وجاري المعالجة')")
    cursor.execute("INSERT OR IGNORE INTO complaints_status (id, name, description) VALUES (2, 'قيد المعالجة', 'الشكوى قيد المراجعة')")
    cursor.execute("INSERT OR IGNORE INTO complaints_status (id, name, description) VALUES (3, 'مغلقة', 'الشكوى تم حلها')")
    
    conn.commit()
    conn.close()

# Seed sample data
seed_sample_data()

# JWT Configuration
JWT_SECRET = "your-secret-key-here"
JWT_ALGORITHM = "HS256"

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str
    phoneNumber: Optional[str] = None

class TokenResponse(BaseModel):
    AccessToken: str
    RefreshToken: str
    ExpiresAt: Optional[str] = None
    user: Optional[Dict[str, Any]] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.get("/")
async def root():
    return {"message": "مرحباً بكم في أكاديمية الإبداع"}

# نقاط النهاية للدورات
@app.get("/courses")
async def get_courses():
    """الحصول على جميع الدورات"""
    try:
        courses = get_all_courses()
        return {"courses": courses, "status": "success"}
    except Exception as e:
        return {"courses": [], "status": "error", "message": str(e)}

@app.get("/courses/{course_id}")
async def get_course(course_id: int):
    """الحصول على تفاصيل دورة محددة"""
    try:
        course = get_course_by_id(course_id)
        if course:
            return {"course": course, "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Course not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Course not found: {str(e)}")

@app.get("/courses/{course_id}/image")
async def get_course_image(course_id: int):
    """الحصول على صورة الدورة"""
    try:
        course = get_course_by_id(course_id)
        if course and course.get('image_url'):
            return {"image": course['image_url'], "status": "success"}
        else:
            return {"image": None, "status": "error", "message": "Image not found"}
    except Exception as e:
        return {"image": None, "status": "error", "message": str(e)}

# نقاط النهاية للفئات الرئيسية للدورات
@app.get("/course-masters")
async def get_course_masters():
    """الحصول على الفئات الرئيسية للدورات"""
    try:
        masters = get_all_course_masters()
        return {"masters": masters, "status": "success"}
    except Exception as e:
        return {"masters": [], "status": "error", "message": str(e)}

@app.get("/course-masters/{master_id}")
async def get_course_master(master_id: int):
    """الحصول على تفاصيل فئة رئيسية محددة"""
    try:
        master = get_course_master_by_id(master_id)
        if master:
            return {"master": master, "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Course master not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Course master not found: {str(e)}")

# نقاط النهاية لأنواع الدورات
@app.get("/course-types")
async def get_course_types():
    """الحصول على أنواع الدورات"""
    try:
        types = get_all_course_types()
        return {"types": types, "status": "success"}
    except Exception as e:
        return {"types": [], "status": "error", "message": str(e)}

# نقاط النهاية لبيانات الأكاديمية
@app.get("/academy-data")
async def get_academy_data_endpoint():
    """الحصول على بيانات الأكاديمية"""
    try:
        data = get_academy_data()
        return {"data": data, "status": "success"}
    except Exception as e:
        return {"data": [], "status": "error", "message": str(e)}

# نقاط النهاية للوظائف
@app.get("/jobs")
async def get_jobs():
    """الحصول على الوظائف المتاحة"""
    try:
        jobs = get_all_jobs()
        return {"jobs": jobs, "status": "success"}
    except Exception as e:
        return {"jobs": [], "status": "error", "message": str(e)}

# نقاط النهاية للفروع
@app.get("/branches")
async def get_branches():
    """الحصول على فروع الأكاديمية"""
    try:
        branches = get_all_branches()
        return {"branches": branches, "status": "success"}
    except Exception as e:
        return {"branches": [], "status": "error", "message": str(e)}

# نقاط النهاية للبرامج
@app.get("/programs")
async def get_programs():
    """الحصول على البرامج التعليمية"""
    try:
        programs = get_all_programs()
        return {"programs": programs, "status": "success"}
    except Exception as e:
        return {"programs": [], "status": "error", "message": str(e)}

@app.get("/programs/{program_id}")
async def get_program(program_id: int):
    """الحصول على تفاصيل برنامج محدد"""
    try:
        program = get_program_by_id(program_id)
        if program:
            return {"program": program, "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Program not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Program not found: {str(e)}")

@app.get("/program-details")
async def get_program_details():
    """الحصول على تفاصيل محتوى البرامج"""
    try:
        details = get_all_program_details()
        return {"details": details, "status": "success"}
    except Exception as e:
        return {"details": [], "status": "error", "message": str(e)}

# نقاط النهاية للمشاريع
@app.get("/projects")
async def get_projects():
    """الحصول على المشاريع"""
    try:
        projects = get_all_projects()
        return {"projects": projects, "status": "success"}
    except Exception as e:
        return {"projects": [], "status": "error", "message": str(e)}

@app.get("/projects/{project_id}")
async def get_project(project_id: int):
    """الحصول على تفاصيل مشروع محدد"""
    try:
        project = get_project_by_id(project_id)
        if project:
            return {"project": project, "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Project not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Project not found: {str(e)}")

@app.get("/project-details")
async def get_project_details():
    """الحصول على تفاصيل المشاريع"""
    try:
        details = get_all_project_details()
        return {"details": details, "status": "success"}
    except Exception as e:
        return {"details": [], "status": "error", "message": str(e)}

# نقاط النهاية لتطوير المهارات
@app.get("/skill-development")
async def get_skill_development():
    """الحصول على برامج تطوير المهارات"""
    try:
        skills = get_all_skill_development()
        return {"skills": skills, "status": "success"}
    except Exception as e:
        return {"skills": [], "status": "error", "message": str(e)}

# نقاط النهاية للطلاب
@app.get("/students")
async def get_students():
    """الحصول على بيانات الطلاب"""
    try:
        students = get_all_students()
        return {"students": students, "status": "success"}
    except Exception as e:
        return {"students": [], "status": "error", "message": str(e)}

@app.get("/students/{student_id}")
async def get_student(student_id: int):
    """الحصول على تفاصيل طالب محدد"""
    try:
        student = get_student_by_id(student_id)
        if student:
            return {"student": student, "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Student not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Student not found: {str(e)}")

# نقاط النهاية للمعلمين
@app.get("/teachers")
async def get_teachers():
    """الحصول على بيانات المعلمين"""
    try:
        teachers = get_all_teachers()
        return {"teachers": teachers, "status": "success"}
    except Exception as e:
        return {"teachers": [], "status": "error", "message": str(e)}

@app.get("/teachers/{teacher_id}")
async def get_teacher(teacher_id: int):
    """الحصول على تفاصيل معلم محدد"""
    try:
        teacher = get_teacher_by_id(teacher_id)
        if teacher:
            return {"teacher": teacher, "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Teacher not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Teacher not found: {str(e)}")

# نقاط النهاية لبنك الأسئلة
@app.get("/question-bank")
async def get_question_bank():
    """الحصول على بنك الأسئلة"""
    try:
        questions = get_all_question_bank()
        return {"questions": questions, "status": "success"}
    except Exception as e:
        return {"questions": [], "status": "error", "message": str(e)}

@app.get("/question-details")
async def get_question_details():
    """الحصول على تفاصيل الأسئلة"""
    try:
        details = get_all_question_details()
        return {"details": details, "status": "success"}
    except Exception as e:
        return {"details": [], "status": "error", "message": str(e)}

# نقاط النهاية للشكاوى
@app.get("/complaints")
async def get_complaints():
    """الحصول على جميع الشكاوى"""
    try:
        complaints = get_all_complaints()
        return {"complaints": complaints, "status": "success"}
    except Exception as e:
        return {"complaints": [], "status": "error", "message": str(e)}

@app.get("/complaints/{complaint_id}")
async def get_complaint(complaint_id: str):
    """الحصول على شكوى محددة"""
    try:
        complaint = get_complaint_by_id(complaint_id)
        if complaint:
            return {"complaint": complaint, "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Complaint not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Complaint not found: {str(e)}")

@app.post("/complaints")
async def create_complaint(complaint_data: dict):
    """إنشاء شكوى جديدة"""
    try:
        complaint = create_complaint_local(complaint_data)
        return {"complaint": complaint, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create complaint: {str(e)}")

@app.put("/complaints/{complaint_id}")
async def update_complaint(complaint_id: str, complaint_data: dict):
    """تحديث شكوى موجودة"""
    try:
        # For now, return success - would need to implement update function
        return {"complaint": {"id": complaint_id, **complaint_data}, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update complaint: {str(e)}")

@app.delete("/complaints/{complaint_id}")
async def delete_complaint(complaint_id: str):
    """حذف شكوى"""
    try:
        # For now, return success - would need to implement delete function
        return {"message": "Complaint deleted successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete complaint: {str(e)}")

@app.get("/complaints/student/{student_id}")
async def get_student_complaints(student_id: str):
    """الحصول على شكاوى طالب محدد"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, s.name as student_name, ct.name as complaint_type_name, cs.name as status_name
            FROM complaints_student c
            LEFT JOIN student_data s ON c.student_id = s.id
            LEFT JOIN complaints_type ct ON c.complaint_type_id = ct.id
            LEFT JOIN complaints_status cs ON c.status_id = cs.id
            WHERE c.student_id = ?
        """, (student_id,))
        complaints = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"complaints": complaints, "status": "success"}
    except Exception as e:
        return {"complaints": [], "status": "error", "message": str(e)}

@app.get("/complaints/status/{status_id}")
async def get_complaints_by_status(status_id: str):
    """الحصول على الشكاوى حسب الحالة"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, s.name as student_name, ct.name as complaint_type_name, cs.name as status_name
            FROM complaints_student c
            LEFT JOIN student_data s ON c.student_id = s.id
            LEFT JOIN complaints_type ct ON c.complaint_type_id = ct.id
            LEFT JOIN complaints_status cs ON c.status_id = cs.id
            WHERE c.status_id = ?
        """, (status_id,))
        complaints = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"complaints": complaints, "status": "success"}
    except Exception as e:
        return {"complaints": [], "status": "error", "message": str(e)}

@app.get("/complaints/range")
async def get_complaints_by_date_range(from_date: Optional[str] = None, to_date: Optional[str] = None):
    """الحصول على الشكاوى حسب النطاق الزمني"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        query = """
            SELECT c.*, s.name as student_name, ct.name as complaint_type_name, cs.name as status_name
            FROM complaints_student c
            LEFT JOIN student_data s ON c.student_id = s.id
            LEFT JOIN complaints_type ct ON c.complaint_type_id = ct.id
            LEFT JOIN complaints_status cs ON c.status_id = cs.id
            WHERE 1=1
        """
        params = []
        if from_date:
            query += " AND c.created_at >= ?"
            params.append(from_date)
        if to_date:
            query += " AND c.created_at <= ?"
            params.append(to_date)
        cursor.execute(query, params)
        complaints = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"complaints": complaints, "status": "success"}
    except Exception as e:
        return {"complaints": [], "status": "error", "message": str(e)}

@app.get("/complaints/count/{status_id}")
async def get_complaints_count_by_status(status_id: str):
    """الحصول على عدد الشكاوى حسب الحالة"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM complaints_student WHERE status_id = ?", (status_id,))
        count = cursor.fetchone()['count']
        conn.close()
        return {"count": count, "status": "success"}
    except Exception as e:
        return {"count": 0, "status": "error", "message": str(e)}

@app.get("/complaints/{complaint_id}/file")
async def get_complaint_file(complaint_id: str):
    """الحصول على ملف الشكوى"""
    try:
        # For now, return no file - would need to implement file handling
        return {"file": None, "status": "error", "message": "File not available"}
    except Exception as e:
        return {"file": None, "status": "error", "message": str(e)}

# نقاط النهاية لأنواع الشكاوى
@app.get("/complaint-types")
async def get_complaint_types():
    """الحصول على جميع أنواع الشكاوى"""
    try:
        types = get_all_complaint_types()
        return {"types": types, "status": "success"}
    except Exception as e:
        return {"types": [], "status": "error", "message": str(e)}

@app.get("/complaint-types/{type_id}")
async def get_complaint_type(type_id: str):
    """الحصول على نوع شكوى محدد"""
    try:
        complaint_type = get_complaint_type_by_id(int(type_id))
        if complaint_type:
            return {"type": complaint_type, "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Complaint type not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Complaint type not found: {str(e)}")

@app.post("/complaint-types")
async def create_complaint_type(type_data: dict):
    """إنشاء نوع شكوى جديد"""
    try:
        # For now, return success - would need to implement create function
        return {"type": {"id": 999, **type_data}, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create complaint type: {str(e)}")

@app.put("/complaint-types/{type_id}")
async def update_complaint_type(type_id: str, type_data: dict):
    """تحديث نوع شكوى موجود"""
    try:
        # For now, return success - would need to implement update function
        return {"type": {"id": type_id, **type_data}, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update complaint type: {str(e)}")

@app.delete("/complaint-types/{type_id}")
async def delete_complaint_type(type_id: str):
    """حذف نوع شكوى"""
    try:
        # For now, return success - would need to implement delete function
        return {"message": "Complaint type deleted successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete complaint type: {str(e)}")

@app.get("/complaint-types/company/{company_id}")
async def get_company_complaint_types(company_id: str):
    """الحصول على أنواع الشكاوى حسب الشركة"""
    try:
        # For now, return all types - would need to implement company filtering
        types = get_all_complaint_types()
        return {"types": types, "status": "success"}
    except Exception as e:
        return {"types": [], "status": "error", "message": str(e)}

@app.get("/complaint-types/branch/{branch_id}")
async def get_branch_complaint_types(branch_id: str):
    """الحصول على أنواع الشكاوى حسب الفرع"""
    try:
        # For now, return all types - would need to implement branch filtering
        types = get_all_complaint_types()
        return {"types": types, "status": "success"}
    except Exception as e:
        return {"types": [], "status": "error", "message": str(e)}

@app.get("/complaint-types/exists")
async def check_complaint_type_exists(name: Optional[str] = None):
    """التحقق من وجود نوع شكوى"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        if name:
            cursor.execute("SELECT COUNT(*) as count FROM complaints_type WHERE name = ? AND active = 1", (name,))
            count = cursor.fetchone()['count']
            exists = count > 0
        else:
            exists = False
        conn.close()
        return {"exists": exists, "status": "success"}
    except Exception as e:
        return {"exists": False, "status": "error", "message": str(e)}

# نقاط النهاية لحالات الشكاوى
@app.get("/complaint-status")
async def get_complaint_status():
    """الحصول على جميع حالات الشكاوى"""
    try:
        status_list = get_all_complaint_status()
        return {"status": status_list, "status": "success"}
    except Exception as e:
        return {"status": [], "status": "error", "message": str(e)}

@app.get("/complaint-status/{status_id}")
async def get_complaint_status_by_id(status_id: str):
    """الحصول على حالة شكوى محددة"""
    try:
        status = get_complaint_status_by_id(int(status_id))
        if status:
            return {"status": status, "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Complaint status not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Complaint status not found: {str(e)}")

@app.post("/complaint-status")
async def create_complaint_status(status_data: dict):
    """إنشاء حالة شكوى جديدة"""
    try:
        # For now, return success - would need to implement create function
        return {"status": {"id": 999, **status_data}, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create complaint status: {str(e)}")

@app.put("/complaint-status/{status_id}")
async def update_complaint_status(status_id: str, status_data: dict):
    """تحديث حالة شكوى موجودة"""
    try:
        # For now, return success - would need to implement update function
        return {"status": {"id": status_id, **status_data}, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update complaint status: {str(e)}")

@app.delete("/complaint-status/{status_id}")
async def delete_complaint_status(status_id: str):
    """حذف حالة شكوى"""
    try:
        # For now, return success - would need to implement delete function
        return {"message": "Complaint status deleted successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete complaint status: {str(e)}")

# نقاط النهاية للمواقع الجغرافية
@app.get("/countries")
async def get_countries():
    """الحصول على الدول"""
    try:
        countries = get_all_countries()
        return {"countries": countries, "status": "success"}
    except Exception as e:
        return {"countries": [], "status": "error", "message": str(e)}

@app.get("/governorates")
async def get_governorates():
    """الحصول على المحافظات"""
    try:
        governorates = get_all_governorates()
        return {"governorates": governorates, "status": "success"}
    except Exception as e:
        return {"governorates": [], "status": "error", "message": str(e)}

@app.get("/cities")
async def get_cities():
    """الحصول على المدن"""
    try:
        cities = get_all_cities()
        return {"cities": cities, "status": "success"}
    except Exception as e:
        return {"cities": [], "status": "error", "message": str(e)}

# نقاط النهاية للحضور والتقييم
@app.get("/attendance")
async def get_attendance():
    """الحصول على بيانات الحضور"""
    try:
        attendance = get_all_attendance()
        return {"attendance": attendance, "status": "success"}
    except Exception as e:
        return {"attendance": [], "status": "error", "message": str(e)}

@app.get("/evaluations")
async def get_evaluations():
    """الحصول على التقييمات"""
    try:
        evaluations = get_all_evaluations()
        return {"evaluations": evaluations, "status": "success"}
    except Exception as e:
        return {"evaluations": [], "status": "error", "message": str(e)}

@app.get("/student-groups")
async def get_student_groups():
    """الحصول على مجموعات الطلاب"""
    try:
        groups = get_all_student_groups()
        return {"groups": groups, "status": "success"}
    except Exception as e:
        return {"groups": [], "status": "error", "message": str(e)}

# نقاط النهاية للدردشة
@app.get("/chat/messages")
async def get_chat_messages():
    """الحصول على رسائل الدردشة"""
    try:
        messages = get_all_chat_messages()
        return {"messages": messages, "status": "success"}
    except Exception as e:
        return {"messages": [], "status": "error", "message": str(e)}

# Authentication endpoints
@app.post("/api/Account/login")
async def login(login_data: LoginRequest):
    """Login endpoint"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user exists in student_data or teacher_data
        cursor.execute("SELECT * FROM student_data WHERE email = ? AND active = 1", (login_data.email,))
        user = cursor.fetchone()
        user_type = "student"
        
        if not user:
            cursor.execute("SELECT * FROM teacher_data WHERE email = ? AND active = 1", (login_data.email,))
            user = cursor.fetchone()
            user_type = "teacher"
        
        if not user:
            # Create a demo user for testing with the provided credentials
            if login_data.email == "yjmt469999@gmail.com" and login_data.password == "Vx9!pQ2@Lm#7wRz":
                user_data = {
                    "id": 1,
                    "email": login_data.email,
                    "name": "Demo User",
                    "role": "Admin",
                    "firstName": "Demo",
                    "lastName": "User"
                }
                
                access_token = create_access_token(data=user_data)
                refresh_token = create_refresh_token(data=user_data)
                
                return TokenResponse(
                    AccessToken=access_token,
                    RefreshToken=refresh_token,
                    ExpiresAt=(datetime.utcnow() + timedelta(hours=24)).isoformat(),
                    user=user_data
                )
            else:
                raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # For demo purposes, accept any password for existing users
        user_dict = dict(user)
        user_data = {
            "id": user_dict["id"],
            "email": user_dict["email"],
            "name": user_dict.get("name", f"{user_dict.get('firstName', '')} {user_dict.get('lastName', '')}"),
            "role": user_type.capitalize(),
            "firstName": user_dict.get("firstName", ""),
            "lastName": user_dict.get("lastName", ""),
            "userType": user_type
        }
        
        access_token = create_access_token(data=user_data)
        refresh_token = create_refresh_token(data=user_data)
        
        conn.close()
        
        return TokenResponse(
            AccessToken=access_token,
            RefreshToken=refresh_token,
            ExpiresAt=(datetime.utcnow() + timedelta(hours=24)).isoformat(),
            user=user_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/Account/me")
async def get_current_user():
    """Get current user info - returns demo user for testing"""
    # Return demo user data for testing purposes
    return {
        "id": 1,
        "email": "yjmt469999@gmail.com",
        "name": "Demo User",
        "role": "Admin",
        "firstName": "Demo",
        "lastName": "User"
    }

def get_all_academies():
    """Get all academies from the database"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM academy_data")
    academies = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return academies

# API endpoints that the frontend expects
@app.get("/api/AcademyData")
async def get_academy_data_api():
    """Get academy data - API endpoint"""
    try:
        academies = get_all_academies()
        return {"academies": academies, "status": "success"}
    except Exception as e:
        return {"academies": [], "status": "error", "message": str(e)}

@app.post("/api/AcademyData")
async def create_academy_data_api(request: Request):
    """Create new academy data - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/AcademyData called")
        print("=" * 80)
        
        # Log all headers
        print("📋 Request Headers:")
        for key, value in request.headers.items():
            print(f"  {key}: {value}")
        
        content_type = request.headers.get('content-type', '')
        print(f"📋 Content-Type: '{content_type}'")
        print(f"📋 Content-Length: {request.headers.get('content-length', 'unknown')}")
        
        # Log raw body for debugging
        try:
            body = await request.body()
            print(f"📋 Raw Body (first 500 chars): {body[:500]}")
            print(f"📋 Raw Body Length: {len(body)}")
            
            # Reset the request body for further processing
            async def receive():
                return {"type": "http.request", "body": body, "more_body": False}
            request._receive = receive
            
        except Exception as e:
            print(f"❌ Error reading raw body: {e}")
        
        name = ""
        description = ""
        address = ""
        phone = ""
        email = ""
        website = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                for key, value in form_data.items():
                    print(f"  {key}: {value} (type: {type(value)})")
                
                name = str(form_data.get("AcademyNameL1", ""))
                description = str(form_data.get("Description", ""))
                address = str(form_data.get("AcademyAddress", ""))
                phone = str(form_data.get("AcademyPhone", ""))
                email = str(form_data.get("AcademyEmail", ""))
                website = str(form_data.get("AcademyWebSite", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"JSON data: {json_data}")
                
                name = str(json_data.get("AcademyNameL1", ""))
                description = str(json_data.get("Description", ""))
                address = str(json_data.get("AcademyAddress", ""))
                phone = str(json_data.get("AcademyPhone", ""))
                email = str(json_data.get("AcademyEmail", ""))
                website = str(json_data.get("AcademyWebSite", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"Form data fields: {list(form_data.keys())}")
                
                name = str(form_data.get("AcademyNameL1", ""))
                description = str(form_data.get("Description", ""))
                address = str(form_data.get("AcademyAddress", ""))
                phone = str(form_data.get("AcademyPhone", ""))
                email = str(form_data.get("AcademyEmail", ""))
                website = str(form_data.get("AcademyWebSite", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"Extracted academy data: name='{name}', description='{description}', address='{address}', email='{email}', phone='{phone}', website='{website}'")
        
        # Validate required fields
        if not name.strip():
            return {"status": "error", "message": "Academy name is required"}
        
        # Create the academy in the database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO academy_data (name, description, address, phone, email, website)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            name,
            description,
            address,
            phone,
            email,
            website
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get the created academy
        cursor.execute("SELECT * FROM academy_data WHERE rowid = last_insert_rowid()")
        academy = cursor.fetchone()
        conn.close()
        
        if academy:
            result = dict(academy)
            print(f"✅ Retrieved created academy: {result}")
            return {"academy": result, "status": "success"}
        else:
            print("❌ No academy retrieved after insert")
            return {"status": "error", "message": "Failed to create academy"}
            
    except Exception as e:
        print(f"❌ Error in create_academy_data_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.put("/api/AcademyData/{academy_id}")
async def update_academy_data_api(academy_id: int, request: Request):
    """Update academy data - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/AcademyData/{academy_id} called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        name = ""
        description = ""
        address = ""
        phone = ""
        email = ""
        website = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                name = str(form_data.get("AcademyName", ""))
                description = str(form_data.get("Description", ""))
                address = str(form_data.get("Address", ""))
                phone = str(form_data.get("Phone", ""))
                email = str(form_data.get("Email", ""))
                website = str(form_data.get("Website", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                name = str(json_data.get("AcademyName", ""))
                description = str(json_data.get("Description", ""))
                address = str(json_data.get("Address", ""))
                phone = str(json_data.get("Phone", ""))
                email = str(json_data.get("Email", ""))
                website = str(json_data.get("Website", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                name = str(form_data.get("AcademyName", ""))
                description = str(form_data.get("Description", ""))
                address = str(form_data.get("Address", ""))
                phone = str(form_data.get("Phone", ""))
                email = str(form_data.get("Email", ""))
                website = str(form_data.get("Website", ""))
            except:
                return {"academy": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_academy = update_academy_data(academy_id, name, description, address, phone, email, website)
        
        if updated_academy:
            return {"academy": updated_academy, "status": "success", "message": "Academy updated successfully"}
        else:
            return {"academy": None, "status": "error", "message": "Failed to update academy"}
        
    except Exception as e:
        return {"academy": None, "status": "error", "message": str(e)}

@app.get("/api/BranchData")
async def get_branch_data_api():
    """Get branch data - API endpoint"""
    try:
        branches = get_all_branches()
        return {"branches": branches, "status": "success"}
    except Exception as e:
        return {"branches": [], "status": "error", "message": str(e)}

@app.post("/api/BranchData")
async def create_branch_data_api(request: Request):
    """Create new branch data - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/BranchData called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        branch_name = ""
        branch_address = ""
        branch_phone = ""
        branch_email = ""
        academy_id = ""
        governorate_id = ""
        city_id = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                branch_name = str(form_data.get("BranchNameL1", ""))
                branch_address = str(form_data.get("BranchAddress", ""))
                branch_phone = str(form_data.get("BranchPhone", ""))
                branch_email = str(form_data.get("BranchEmail", ""))
                academy_id = str(form_data.get("AcademyId", ""))
                governorate_id = str(form_data.get("GovernorateId", ""))
                city_id = str(form_data.get("CityId", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                branch_name = str(json_data.get("BranchNameL1", ""))
                branch_address = str(json_data.get("BranchAddress", ""))
                branch_phone = str(json_data.get("BranchPhone", ""))
                branch_email = str(json_data.get("BranchEmail", ""))
                academy_id = str(json_data.get("AcademyId", ""))
                governorate_id = str(json_data.get("GovernorateId", ""))
                city_id = str(json_data.get("CityId", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                branch_name = str(form_data.get("BranchNameL1", ""))
                branch_address = str(form_data.get("BranchAddress", ""))
                branch_phone = str(form_data.get("BranchPhone", ""))
                branch_email = str(form_data.get("BranchEmail", ""))
                academy_id = str(form_data.get("AcademyId", ""))
                governorate_id = str(form_data.get("GovernorateId", ""))
                city_id = str(form_data.get("CityId", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted branch data: name='{branch_name}', address='{branch_address}', phone='{branch_phone}', email='{branch_email}', academy_id='{academy_id}', governorate_id='{governorate_id}', city_id='{city_id}'")
        
        # Validate required fields
        if not branch_name.strip():
            return {"status": "error", "message": "Branch name is required"}
        
        # Create the branch in the database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO branch_data (academy_id, name, address, phone, email, governorate_id, city_id, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            int(academy_id) if academy_id.isdigit() else None,
            branch_name,
            branch_address,
            branch_phone,
            branch_email,
            int(governorate_id) if governorate_id.isdigit() else None,
            int(city_id) if city_id.isdigit() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get the created branch
        cursor.execute("SELECT * FROM branch_data WHERE rowid = last_insert_rowid()")
        branch = cursor.fetchone()
        conn.close()
        
        if branch:
            result = dict(branch)
            print(f"✅ Retrieved created branch: {result}")
            return {"branch": result, "status": "success"}
        else:
            print("❌ No branch retrieved after insert")
            return {"status": "error", "message": "Failed to create branch"}
            
    except Exception as e:
        print(f"❌ Error in create_branch_data_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.put("/api/BranchData/{branch_id}")
async def update_branch_data_api(branch_id: int, request: Request):
    """Update branch data - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/BranchData/{branch_id} called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        academy_id = ""
        name = ""
        address = ""
        phone = ""
        email = ""
        governorate_id = ""
        city_id = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                academy_id = str(form_data.get("AcademyId", ""))
                name = str(form_data.get("BranchName", ""))
                address = str(form_data.get("Address", ""))
                phone = str(form_data.get("Phone", ""))
                email = str(form_data.get("Email", ""))
                governorate_id = str(form_data.get("GovernorateId", ""))
                city_id = str(form_data.get("CityId", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                academy_id = str(json_data.get("AcademyId", ""))
                name = str(json_data.get("BranchName", ""))
                address = str(json_data.get("Address", ""))
                phone = str(json_data.get("Phone", ""))
                email = str(json_data.get("Email", ""))
                governorate_id = str(json_data.get("GovernorateId", ""))
                city_id = str(json_data.get("CityId", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                academy_id = str(form_data.get("AcademyId", ""))
                name = str(form_data.get("BranchName", ""))
                address = str(form_data.get("Address", ""))
                phone = str(form_data.get("Phone", ""))
                email = str(form_data.get("Email", ""))
                governorate_id = str(form_data.get("GovernorateId", ""))
                city_id = str(form_data.get("CityId", ""))
            except:
                return {"branch": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_branch = update_branch_data(branch_id, int(academy_id) if academy_id else 0, name, address, phone, email, int(governorate_id) if governorate_id else 0, int(city_id) if city_id else 0)
        
        if updated_branch:
            return {"branch": updated_branch, "status": "success", "message": "Branch updated successfully"}
        else:
            return {"branch": None, "status": "error", "message": "Failed to update branch"}
        
    except Exception as e:
        return {"branch": None, "status": "error", "message": str(e)}

@app.get("/api/StudentData")
async def get_student_data_api():
    """Get student data - API endpoint"""
    try:
        students = get_all_students()
        return {"students": students, "status": "success"}
    except Exception as e:
        return {"students": [], "status": "error", "message": str(e)}

@app.post("/api/StudentData")
async def create_student_data_api(request: Request):
    """Create new student data - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/StudentData called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        student_name = ""
        student_email = ""
        student_phone = ""
        student_address = ""
        birth_date = ""
        enrollment_date = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                student_name = str(form_data.get("StudentName", ""))
                student_email = str(form_data.get("StudentEmail", ""))
                student_phone = str(form_data.get("StudentPhone", ""))
                student_address = str(form_data.get("StudentAddress", ""))
                birth_date = str(form_data.get("BirthDate", ""))
                enrollment_date = str(form_data.get("EnrollmentDate", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                student_name = str(json_data.get("StudentName", ""))
                student_email = str(json_data.get("StudentEmail", ""))
                student_phone = str(json_data.get("StudentPhone", ""))
                student_address = str(json_data.get("StudentAddress", ""))
                birth_date = str(json_data.get("BirthDate", ""))
                enrollment_date = str(json_data.get("EnrollmentDate", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                student_name = str(form_data.get("StudentName", ""))
                student_email = str(form_data.get("StudentEmail", ""))
                student_phone = str(form_data.get("StudentPhone", ""))
                student_address = str(form_data.get("StudentAddress", ""))
                birth_date = str(form_data.get("BirthDate", ""))
                enrollment_date = str(form_data.get("EnrollmentDate", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted student data: name='{student_name}', email='{student_email}', phone='{student_phone}', address='{student_address}', birth_date='{birth_date}', enrollment_date='{enrollment_date}'")
        
        # Validate required fields
        if not student_name.strip():
            return {"status": "error", "message": "Student name is required"}
        
        # Create student in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO student_data (name, email, phone, address, birth_date, enrollment_date, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (
            student_name,
            student_email if student_email.strip() else None,
            student_phone,
            student_address,
            birth_date if birth_date.strip() else None,
            enrollment_date if enrollment_date.strip() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get created student
        cursor.execute("SELECT * FROM student_data WHERE rowid = last_insert_rowid()")
        student = cursor.fetchone()
        conn.close()
        
        if student:
            result = dict(student)
            print(f"✅ Retrieved created student: {result}")
            return {"student": result, "status": "success"}
        else:
            print("❌ No student retrieved after insert")
            return {"status": "error", "message": "Failed to create student"}
            
    except Exception as e:
        print(f"❌ Error in create_student_data_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.put("/api/StudentData/{student_id}")
async def update_student_data_api(student_id: int, request: Request):
    """Update student data - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/StudentData/{student_id} called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        name = ""
        email = ""
        phone = ""
        address = ""
        birth_date = ""
        enrollment_date = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                name = str(form_data.get("StudentName", ""))
                email = str(form_data.get("Email", ""))
                phone = str(form_data.get("Phone", ""))
                address = str(form_data.get("Address", ""))
                birth_date = str(form_data.get("BirthDate", ""))
                enrollment_date = str(form_data.get("EnrollmentDate", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                name = str(json_data.get("StudentName", ""))
                email = str(json_data.get("Email", ""))
                phone = str(json_data.get("Phone", ""))
                address = str(json_data.get("Address", ""))
                birth_date = str(json_data.get("BirthDate", ""))
                enrollment_date = str(json_data.get("EnrollmentDate", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                name = str(form_data.get("StudentName", ""))
                email = str(form_data.get("Email", ""))
                phone = str(form_data.get("Phone", ""))
                address = str(form_data.get("Address", ""))
                birth_date = str(form_data.get("BirthDate", ""))
                enrollment_date = str(form_data.get("EnrollmentDate", ""))
            except:
                return {"student": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_student = update_student_data(student_id, name, email, phone, address, birth_date, enrollment_date)
        
        if updated_student:
            return {"student": updated_student, "status": "success", "message": "Student updated successfully"}
        else:
            return {"student": None, "status": "error", "message": "Failed to update student"}
        
    except Exception as e:
        return {"student": None, "status": "error", "message": str(e)}

@app.get("/api/TeacherData")
async def get_teacher_data_api():
    """Get teacher data - API endpoint"""
    try:
        teachers = get_all_teachers()
        return {"teachers": teachers, "status": "success"}
    except Exception as e:
        return {"teachers": [], "status": "error", "message": str(e)}

@app.post("/api/TeacherData")
async def create_teacher_data_api(request: Request):
    """Create new teacher data - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/TeacherData called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        teacher_name = ""
        teacher_email = ""
        teacher_phone = ""
        teacher_specialization = ""
        teacher_experience = ""
        teacher_bio = ""
        teacher_image_url = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                teacher_name = str(form_data.get("TeacherName", ""))
                teacher_email = str(form_data.get("TeacherEmail", ""))
                teacher_phone = str(form_data.get("TeacherPhone", ""))
                teacher_specialization = str(form_data.get("TeacherSpecialization", ""))
                teacher_experience = str(form_data.get("TeacherExperience", ""))
                teacher_bio = str(form_data.get("TeacherBio", ""))
                teacher_image_url = str(form_data.get("TeacherImageUrl", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                teacher_name = str(json_data.get("TeacherName", ""))
                teacher_email = str(json_data.get("TeacherEmail", ""))
                teacher_phone = str(json_data.get("TeacherPhone", ""))
                teacher_specialization = str(json_data.get("TeacherSpecialization", ""))
                teacher_experience = str(json_data.get("TeacherExperience", ""))
                teacher_bio = str(json_data.get("TeacherBio", ""))
                teacher_image_url = str(json_data.get("TeacherImageUrl", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                teacher_name = str(form_data.get("TeacherName", ""))
                teacher_email = str(form_data.get("TeacherEmail", ""))
                teacher_phone = str(form_data.get("TeacherPhone", ""))
                teacher_specialization = str(form_data.get("TeacherSpecialization", ""))
                teacher_experience = str(form_data.get("TeacherExperience", ""))
                teacher_bio = str(form_data.get("TeacherBio", ""))
                teacher_image_url = str(form_data.get("TeacherImageUrl", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted teacher data: name='{teacher_name}', email='{teacher_email}', phone='{teacher_phone}', specialization='{teacher_specialization}', experience='{teacher_experience}', bio='{teacher_bio}', image_url='{teacher_image_url}'")
        
        # Validate required fields
        if not teacher_name.strip():
            return {"status": "error", "message": "Teacher name is required"}
        
        # Create teacher in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO teacher_data (name, email, phone, specialization, experience_years, bio, image_url, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            teacher_name,
            teacher_email if teacher_email.strip() else None,
            teacher_phone,
            teacher_specialization,
            int(teacher_experience) if teacher_experience.isdigit() else None,
            teacher_bio,
            teacher_image_url if teacher_image_url.strip() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get created teacher
        cursor.execute("SELECT * FROM teacher_data WHERE rowid = last_insert_rowid()")
        teacher = cursor.fetchone()
        conn.close()
        
        if teacher:
            result = dict(teacher)
            print(f"✅ Retrieved created teacher: {result}")
            return {"teacher": result, "status": "success"}
        else:
            print("❌ No teacher retrieved after insert")
            return {"status": "error", "message": "Failed to create teacher"}
            
    except Exception as e:
        print(f"❌ Error in create_teacher_data_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.put("/api/TeacherData/{teacher_id}")
async def update_teacher_data_api(teacher_id: int, request: Request):
    """Update teacher data - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/TeacherData/{teacher_id} called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        name = ""
        email = ""
        phone = ""
        specialization = ""
        experience_years = ""
        bio = ""
        image_url = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                name = str(form_data.get("TeacherName", ""))
                email = str(form_data.get("Email", ""))
                phone = str(form_data.get("Phone", ""))
                specialization = str(form_data.get("Specialization", ""))
                experience_years = str(form_data.get("ExperienceYears", ""))
                bio = str(form_data.get("Bio", ""))
                image_url = str(form_data.get("ImageUrl", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                name = str(json_data.get("TeacherName", ""))
                email = str(json_data.get("Email", ""))
                phone = str(json_data.get("Phone", ""))
                specialization = str(json_data.get("Specialization", ""))
                experience_years = str(json_data.get("ExperienceYears", ""))
                bio = str(json_data.get("Bio", ""))
                image_url = str(json_data.get("ImageUrl", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                name = str(form_data.get("TeacherName", ""))
                email = str(form_data.get("Email", ""))
                phone = str(form_data.get("Phone", ""))
                specialization = str(form_data.get("Specialization", ""))
                experience_years = str(form_data.get("ExperienceYears", ""))
                bio = str(form_data.get("Bio", ""))
                image_url = str(form_data.get("ImageUrl", ""))
            except:
                return {"teacher": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_teacher = update_teacher_data(teacher_id, name, email, phone, specialization, int(experience_years) if experience_years else 0, bio, image_url)
        
        if updated_teacher:
            return {"teacher": updated_teacher, "status": "success", "message": "Teacher updated successfully"}
        else:
            return {"teacher": None, "status": "error", "message": "Failed to update teacher"}
        
    except Exception as e:
        return {"teacher": None, "status": "error", "message": str(e)}

@app.delete("/api/TeacherData/{teacher_id}")
async def delete_teacher_data_api(teacher_id: int):
    """Delete teacher data - API endpoint"""
    try:
        print(f"DELETE /api/TeacherData/{teacher_id} called")
        
        # Delete from database
        success = delete_teacher_data(teacher_id)
        
        if success:
            print(f"Teacher {teacher_id} deleted successfully")
            return {"status": "success", "message": "Teacher deleted successfully"}
        else:
            error_msg = f"Teacher {teacher_id} not found"
            print(f"DELETE ERROR: {error_msg}")
            return {"status": "error", "message": error_msg}
        
    except Exception as e:
        error_msg = f"Exception occurred: {str(e)}"
        print(f"{error_msg}")
        return {"status": "error", "message": error_msg}

@app.get("/api/AcademyClaseDetail")
async def get_academy_clase_detail_api():
    """Get academy class details - API endpoint"""
    try:
        courses = get_all_courses()
        return {"courses": courses, "status": "success"}
    except Exception as e:
        return {"courses": [], "status": "error", "message": str(e)}

@app.get("/api/AcademyClaseMaster")
async def get_academy_clase_master_api():
    """Get academy class masters - API endpoint"""
    try:
        masters = get_all_course_masters()
        return {"masters": masters, "status": "success"}
    except Exception as e:
        return {"masters": [], "status": "error", "message": str(e)}

@app.post("/api/AcademyClaseMaster")
async def create_academy_clase_master_api(request: Request):
    """Create new academy class master - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/AcademyClaseMaster called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        master_name = ""
        master_description = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                master_name = str(form_data.get("MasterName", ""))
                master_description = str(form_data.get("MasterDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                master_name = str(json_data.get("MasterName", ""))
                master_description = str(json_data.get("MasterDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                master_name = str(form_data.get("MasterName", ""))
                master_description = str(form_data.get("MasterDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted master data: name='{master_name}', description='{master_description}'")
        
        # Validate required fields
        if not master_name.strip():
            return {"status": "error", "message": "Master name is required"}
        
        # Create master in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO academy_clase_master (name, description, active)
            VALUES (?, ?, 1)
        """, (
            master_name,
            master_description if master_description.strip() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get created master
        cursor.execute("SELECT * FROM academy_clase_master WHERE rowid = last_insert_rowid()")
        master = cursor.fetchone()
        conn.close()
        
        if master:
            result = dict(master)
            print(f"✅ Retrieved created master: {result}")
            return {"master": result, "status": "success"}
        else:
            print("❌ No master retrieved after insert")
            return {"status": "error", "message": "Failed to create master"}
            
    except Exception as e:
        print(f"❌ Error in create_academy_clase_master_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.put("/api/AcademyClaseMaster/{master_id}")
async def update_academy_clase_master_api(master_id: int, request: Request):
    """Update academy class master - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/AcademyClaseMaster/{master_id} called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        name = ""
        description = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                name = str(form_data.get("MasterName", ""))
                description = str(form_data.get("Description", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                name = str(json_data.get("MasterName", ""))
                description = str(json_data.get("Description", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                name = str(form_data.get("MasterName", ""))
                description = str(form_data.get("Description", ""))
            except:
                return {"master": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_master = update_academy_clase_master(master_id, name, description)
        
        if updated_master:
            return {"master": updated_master, "status": "success", "message": "Master updated successfully"}
        else:
            return {"master": None, "status": "error", "message": "Failed to update master"}
        
    except Exception as e:
        return {"master": None, "status": "error", "message": str(e)}

@app.get("/api/AcademyClaseType")
async def get_academy_clase_type_api():
    """Get academy class types - API endpoint"""
    try:
        types = get_all_course_types()
        return {"types": types, "status": "success"}
    except Exception as e:
        return {"types": [], "status": "error", "message": str(e)}

@app.post("/api/AcademyClaseType")
async def create_academy_clase_type_api(request: Request):
    """Create new academy class type - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/AcademyClaseType called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        type_name = ""
        type_description = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                type_name = str(form_data.get("TypeName", ""))
                type_description = str(form_data.get("TypeDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                type_name = str(json_data.get("TypeName", ""))
                type_description = str(json_data.get("TypeDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                type_name = str(form_data.get("TypeName", ""))
                type_description = str(form_data.get("TypeDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted type data: name='{type_name}', description='{type_description}'")
        
        # Validate required fields
        if not type_name.strip():
            return {"status": "error", "message": "Type name is required"}
        
        # Create type in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO academy_clase_type (name, description, active)
            VALUES (?, ?, 1)
        """, (
            type_name,
            type_description if type_description.strip() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get created type
        cursor.execute("SELECT * FROM academy_clase_type WHERE rowid = last_insert_rowid()")
        type_record = cursor.fetchone()
        conn.close()
        
        if type_record:
            result = dict(type_record)
            print(f"✅ Retrieved created type: {result}")
            return {"type": result, "status": "success"}
        else:
            print("❌ No type retrieved after insert")
            return {"status": "error", "message": "Failed to create type"}
            
    except Exception as e:
        print(f"❌ Error in create_academy_clase_type_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.put("/api/AcademyClaseType/{type_id}")
async def update_academy_clase_type_api(type_id: int, request: Request):
    """Update academy class type - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/AcademyClaseType/{type_id} called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        name = ""
        description = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                name = str(form_data.get("TypeName", ""))
                description = str(form_data.get("Description", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                name = str(json_data.get("TypeName", ""))
                description = str(json_data.get("Description", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                name = str(form_data.get("TypeName", ""))
                description = str(form_data.get("Description", ""))
            except:
                return {"type": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_type = update_academy_clase_type(type_id, name, description)
        
        if updated_type:
            return {"type": updated_type, "status": "success", "message": "Type updated successfully"}
        else:
            return {"type": None, "status": "error", "message": "Failed to update type"}
        
    except Exception as e:
        return {"type": None, "status": "error", "message": str(e)}

@app.get("/api/AcademyJob")
async def get_academy_job_api():
    """Get academy jobs - API endpoint"""
    try:
        jobs = get_all_jobs()
        return {"jobs": jobs, "status": "success"}
    except Exception as e:
        return {"jobs": [], "status": "error", "message": str(e)}

@app.post("/api/AcademyJob")
async def create_academy_job_api(request: Request):
    """Create new academy job - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/AcademyJob called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        job_title = ""
        job_description = ""
        job_requirements = ""
        job_salary_range = ""
        job_location = ""
        job_type = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                job_title = str(form_data.get("JobTitle", ""))
                job_description = str(form_data.get("JobDescription", ""))
                job_requirements = str(form_data.get("JobRequirements", ""))
                job_salary_range = str(form_data.get("JobSalaryRange", ""))
                job_location = str(form_data.get("JobLocation", ""))
                job_type = str(form_data.get("JobType", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                job_title = str(json_data.get("JobTitle", ""))
                job_description = str(json_data.get("JobDescription", ""))
                job_requirements = str(json_data.get("JobRequirements", ""))
                job_salary_range = str(json_data.get("JobSalaryRange", ""))
                job_location = str(json_data.get("JobLocation", ""))
                job_type = str(json_data.get("JobType", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                job_title = str(form_data.get("JobTitle", ""))
                job_description = str(form_data.get("JobDescription", ""))
                job_requirements = str(form_data.get("JobRequirements", ""))
                job_salary_range = str(form_data.get("JobSalaryRange", ""))
                job_location = str(form_data.get("JobLocation", ""))
                job_type = str(form_data.get("JobType", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted job data: title='{job_title}', description='{job_description}', requirements='{job_requirements}', salary_range='{job_salary_range}', location='{job_location}', type='{job_type}'")
        
        # Validate required fields
        if not job_title.strip():
            return {"status": "error", "message": "Job title is required"}
        
        # Create job in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO academy_job (title, description, requirements, salary_range, location, type, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (
            job_title,
            job_description if job_description.strip() else None,
            job_requirements if job_requirements.strip() else None,
            job_salary_range if job_salary_range.strip() else None,
            job_location if job_location.strip() else None,
            job_type if job_type.strip() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get created job
        cursor.execute("SELECT * FROM academy_job WHERE rowid = last_insert_rowid()")
        job = cursor.fetchone()
        conn.close()
        
        if job:
            result = dict(job)
            print(f"✅ Retrieved created job: {result}")
            return {"job": result, "status": "success"}
        else:
            print("❌ No job retrieved after insert")
            return {"status": "error", "message": "Failed to create job"}
            
    except Exception as e:
        print(f"❌ Error in create_academy_job_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.put("/api/AcademyJob/{job_id}")
async def update_academy_job_api(job_id: int, request: Request):
    """Update academy job - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/AcademyJob/{job_id} called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        title = ""
        description = ""
        requirements = ""
        salary_range = ""
        location = ""
        type = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                title = str(form_data.get("JobTitle", ""))
                description = str(form_data.get("Description", ""))
                requirements = str(form_data.get("Requirements", ""))
                salary_range = str(form_data.get("SalaryRange", ""))
                location = str(form_data.get("Location", ""))
                type = str(form_data.get("JobType", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                title = str(json_data.get("JobTitle", ""))
                description = str(json_data.get("Description", ""))
                requirements = str(json_data.get("Requirements", ""))
                salary_range = str(json_data.get("SalaryRange", ""))
                location = str(json_data.get("Location", ""))
                type = str(json_data.get("JobType", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                title = str(form_data.get("JobTitle", ""))
                description = str(form_data.get("Description", ""))
                requirements = str(form_data.get("Requirements", ""))
                salary_range = str(form_data.get("SalaryRange", ""))
                location = str(form_data.get("Location", ""))
                type = str(form_data.get("JobType", ""))
            except:
                return {"job": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_job = update_academy_job(job_id, title, description, requirements, salary_range, location, type)
        
        if updated_job:
            return {"job": updated_job, "status": "success", "message": "Job updated successfully"}
        else:
            return {"job": None, "status": "error", "message": "Failed to update job"}
        
    except Exception as e:
        return {"job": None, "status": "error", "message": str(e)}

@app.get("/api/ProjectsMaster")
async def get_projects_master_api():
    """Get projects master data - API endpoint"""
    try:
        projects = get_all_projects()
        return {"projects": projects, "status": "success"}
    except Exception as e:
        return {"projects": [], "status": "error", "message": str(e)}

@app.post("/api/ProjectsMaster")
async def create_projects_master_api(request: Request):
    """Create new project master - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/ProjectsMaster called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        project_name = ""
        project_description = ""
        project_category = ""
        project_status = ""
        project_start_date = ""
        project_end_date = ""
        project_image_url = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                project_name = str(form_data.get("ProjectName", ""))
                project_description = str(form_data.get("ProjectDescription", ""))
                project_category = str(form_data.get("ProjectCategory", ""))
                project_status = str(form_data.get("ProjectStatus", "pending"))
                project_start_date = str(form_data.get("ProjectStartDate", ""))
                project_end_date = str(form_data.get("ProjectEndDate", ""))
                project_image_url = str(form_data.get("ProjectImageUrl", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                project_name = str(json_data.get("ProjectName", ""))
                project_description = str(json_data.get("ProjectDescription", ""))
                project_category = str(json_data.get("ProjectCategory", ""))
                project_status = str(json_data.get("ProjectStatus", "pending"))
                project_start_date = str(json_data.get("ProjectStartDate", ""))
                project_end_date = str(json_data.get("ProjectEndDate", ""))
                project_image_url = str(json_data.get("ProjectImageUrl", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                project_name = str(form_data.get("ProjectName", ""))
                project_description = str(form_data.get("ProjectDescription", ""))
                project_category = str(form_data.get("ProjectCategory", ""))
                project_status = str(form_data.get("ProjectStatus", "pending"))
                project_start_date = str(form_data.get("ProjectStartDate", ""))
                project_end_date = str(form_data.get("ProjectEndDate", ""))
                project_image_url = str(form_data.get("ProjectImageUrl", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted project data: name='{project_name}', description='{project_description}', category='{project_category}', status='{project_status}', start_date='{project_start_date}', end_date='{project_end_date}', image_url='{project_image_url}'")
        
        # Validate required fields
        if not project_name.strip():
            return {"status": "error", "message": "Project name is required"}
        
        # Create project in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO projects_master (name, description, category, status, start_date, end_date, image_url, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            project_name,
            project_description if project_description.strip() else None,
            project_category if project_category.strip() else None,
            project_status if project_status.strip() else "pending",
            project_start_date if project_start_date.strip() else None,
            project_end_date if project_end_date.strip() else None,
            project_image_url if project_image_url.strip() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get created project
        cursor.execute("SELECT * FROM projects_master WHERE rowid = last_insert_rowid()")
        project = cursor.fetchone()
        conn.close()
        
        if project:
            result = dict(project)
            print(f"✅ Retrieved created project: {result}")
            return {"project": result, "status": "success"}
        else:
            print("❌ No project retrieved after insert")
            return {"status": "error", "message": "Failed to create project"}
            
    except Exception as e:
        print(f"❌ Error in create_projects_master_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.put("/api/ProjectsMaster/{project_id}")
async def update_projects_master_api(project_id: int, request: Request):
    """Update project master - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/ProjectsMaster/{project_id} called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        name = ""
        description = ""
        category = ""
        status = ""
        start_date = ""
        end_date = ""
        image_url = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                name = str(form_data.get("ProjectName", ""))
                description = str(form_data.get("Description", ""))
                category = str(form_data.get("Category", ""))
                status = str(form_data.get("Status", ""))
                start_date = str(form_data.get("StartDate", ""))
                end_date = str(form_data.get("EndDate", ""))
                image_url = str(form_data.get("ImageUrl", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                name = str(json_data.get("ProjectName", ""))
                description = str(json_data.get("Description", ""))
                category = str(json_data.get("Category", ""))
                status = str(json_data.get("Status", ""))
                start_date = str(json_data.get("StartDate", ""))
                end_date = str(json_data.get("EndDate", ""))
                image_url = str(json_data.get("ImageUrl", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                name = str(form_data.get("ProjectName", ""))
                description = str(form_data.get("Description", ""))
                category = str(form_data.get("Category", ""))
                status = str(form_data.get("Status", ""))
                start_date = str(form_data.get("StartDate", ""))
                end_date = str(form_data.get("EndDate", ""))
                image_url = str(form_data.get("ImageUrl", ""))
            except:
                return {"project": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_project = update_projects_master(project_id, name, description, category, status, start_date, end_date, image_url)
        
        if updated_project:
            return {"project": updated_project, "status": "success", "message": "Project updated successfully"}
        else:
            return {"project": None, "status": "error", "message": "Failed to update project"}
        
    except Exception as e:
        return {"project": None, "status": "error", "message": str(e)}

@app.get("/api/ProjectsMaster/{project_id}")
async def get_project_by_id_api(project_id: str):
    """Get a specific project by ID - API endpoint"""
    try:
        project = get_project_by_id(project_id)
        if project:
            return {"project": project, "status": "success"}
        else:
            return {"project": None, "status": "error", "message": "Project not found"}
    except Exception as e:
        return {"project": None, "status": "error", "message": str(e)}

@app.get("/api/ProjectsDetail")
async def get_projects_detail_api():
    """Get projects detail data - API endpoint"""
    try:
        project_details = get_all_project_details()
        return {"project_details": project_details, "status": "success"}
    except Exception as e:
        return {"project_details": [], "status": "error", "message": str(e)}

@app.post("/api/ProjectsDetail")
async def create_projects_detail_api(request: Request):
    """Create new project detail - API endpoint"""
    try:
        content_type = request.headers.get('content-type', '')
        
        project_id = ""
        title = ""
        content = ""
        order_index = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                project_id = str(form_data.get("ProjectsMasterId", ""))
                title = str(form_data.get("ProjectTitle", ""))
                content = str(form_data.get("ProjectContent", ""))
                order_index = str(form_data.get("OrderIndex", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                project_id = str(json_data.get("ProjectsMasterId", ""))
                title = str(json_data.get("ProjectTitle", ""))
                content = str(json_data.get("ProjectContent", ""))
                order_index = str(json_data.get("OrderIndex", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                project_id = str(form_data.get("ProjectsMasterId", ""))
                title = str(form_data.get("ProjectTitle", ""))
                content = str(form_data.get("ProjectContent", ""))
                order_index = str(form_data.get("OrderIndex", ""))
            except:
                return {"project_detail": None, "status": "error", "message": "Could not parse request data"}
        
        # Validate required fields
        if not title.strip():
            return {"project_detail": None, "status": "error", "message": "Title is required"}
        
        # Create in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO projects_detail (project_id, title, content, order_index, active)
            VALUES (?, ?, ?, ?, 1)
        """, (
            int(project_id) if project_id else 0,
            title,
            content,
            int(order_index) if order_index else 0
        ))
        
        conn.commit()
        
        # Get the created project detail
        cursor.execute("SELECT * FROM projects_detail WHERE rowid = last_insert_rowid()")
        project_detail = cursor.fetchone()
        conn.close()
        
        if project_detail:
            return {"project_detail": dict(project_detail), "status": "success", "message": "Project detail created successfully"}
        else:
            return {"project_detail": None, "status": "error", "message": "Failed to create project detail"}
        
    except Exception as e:
        return {"project_detail": None, "status": "error", "message": str(e)}

@app.put("/api/ProjectsDetail/{detail_id}")
async def update_projects_detail_api(detail_id: int, request: Request):
    """Update project detail - API endpoint"""
    try:
        content_type = request.headers.get('content-type', '')
        
        project_id = ""
        title = ""
        content = ""
        order_index = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                project_id = str(form_data.get("ProjectsMasterId", ""))
                title = str(form_data.get("ProjectTitle", ""))
                content = str(form_data.get("ProjectContent", ""))
                order_index = str(form_data.get("OrderIndex", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                project_id = str(json_data.get("ProjectsMasterId", ""))
                title = str(json_data.get("ProjectTitle", ""))
                content = str(json_data.get("ProjectContent", ""))
                order_index = str(json_data.get("OrderIndex", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                project_id = str(form_data.get("ProjectsMasterId", ""))
                title = str(form_data.get("ProjectTitle", ""))
                content = str(form_data.get("ProjectContent", ""))
                order_index = str(form_data.get("OrderIndex", ""))
            except:
                return {"project_detail": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_detail = update_projects_detail(detail_id, int(project_id) if project_id else 0, title, content, int(order_index) if order_index else 0)
        
        if updated_detail:
            return {"project_detail": updated_detail, "status": "success", "message": "Project detail updated successfully"}
        else:
            return {"project_detail": None, "status": "error", "message": "Failed to update project detail"}
        
    except Exception as e:
        return {"project_detail": None, "status": "error", "message": str(e)}

@app.get("/api/ProgramsContentMaster")
async def get_programs_content_master_api():
    """Get programs content master data - API endpoint"""
    try:
        programs = get_all_programs()
        return {"programs": programs, "status": "success"}
    except Exception as e:
        return {"programs": [], "status": "error", "message": str(e)}

@app.post("/api/ProgramsContentMaster")
async def create_program_content_master_api(request: Request):
    """Create new program content master - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/ProgramsContentMaster called")
        print("=" * 80)
        
        # Log all headers
        print("📋 Request Headers:")
        for key, value in request.headers.items():
            print(f"  {key}: {value}")
        
        content_type = request.headers.get('content-type', '')
        print(f"📋 Content-Type: '{content_type}'")
        print(f"📋 Content-Length: {request.headers.get('content-length', 'unknown')}")
        
        # Log raw body for debugging
        try:
            body = await request.body()
            print(f"📋 Raw Body (first 500 chars): {body[:500]}")
            print(f"📋 Raw Body Length: {len(body)}")
            
            # Reset the request body for further processing
            async def receive():
                return {"type": "http.request", "body": body, "more_body": False}
            request._receive = receive
            
        except Exception as e:
            print(f"❌ Error reading raw body: {e}")
        
        session_name_l1 = ""
        session_name_l2 = ""
        description = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                for key, value in form_data.items():
                    print(f"  {key}: {value} (type: {type(value)})")
                
                session_name_l1 = str(form_data.get("SessionNameL1", ""))
                session_name_l2 = str(form_data.get("SessionNameL2", ""))
                description = str(form_data.get("Description", ""))
                
            except Exception as e:
                print(f"❌ Error processing FormData: {e}")
                
        elif content_type and 'application/x-www-form-urlencoded' in content_type.lower():
            print("🔧 Processing as application/x-www-form-urlencoded")
            try:
                form_data = await request.form()
                print(f"📋 Form fields: {list(form_data.keys())}")
                
                for key, value in form_data.items():
                    print(f"  {key}: {value} (type: {type(value)})")
                
                session_name_l1 = str(form_data.get("SessionNameL1", ""))
                session_name_l2 = str(form_data.get("SessionNameL2", ""))
                description = str(form_data.get("Description", ""))
                
            except Exception as e:
                print(f"❌ Error processing form-urlencoded: {e}")
                
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as application/json")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                session_name_l1 = str(json_data.get("SessionNameL1", ""))
                session_name_l2 = str(json_data.get("SessionNameL2", ""))
                description = str(json_data.get("Description", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON: {e}")
        else:
            print("🔧 Unknown content type, trying all methods...")
            
            # Try FormData first
            try:
                form_data = await request.form()
                print(f"📋 Fallback FormData: {dict(form_data)}")
                session_name_l1 = str(form_data.get("SessionNameL1", ""))
                session_name_l2 = str(form_data.get("SessionNameL2", ""))
                description = str(form_data.get("Description", ""))
            except:
                print("❌ FormData failed")
                
                # Try JSON
                try:
                    json_data = await request.json()
                    print(f"📋 Fallback JSON: {json_data}")
                    session_name_l1 = str(json_data.get("SessionNameL1", ""))
                    session_name_l2 = str(json_data.get("SessionNameL2", ""))
                    description = str(json_data.get("Description", ""))
                except:
                    print("❌ JSON also failed")
                    return {"program": None, "status": "error", "message": "Could not parse request data"}
        
        print("=" * 50)
        print("📝 EXTRACTED DATA ANALYSIS:")
        print(f"  SessionNameL1: '{session_name_l1}' (length: {len(session_name_l1)}, empty: {not session_name_l1})")
        print(f"  SessionNameL2: '{session_name_l2}' (length: {len(session_name_l2)}, empty: {not session_name_l2})")
        print(f"  Description: '{description}' (length: {len(description)}, empty: {not description})")
        print("=" * 50)
        
        # Validate required fields
        if not session_name_l1.strip():
            error_msg = "SessionNameL1 is required and cannot be empty"
            print(f"❌ VALIDATION ERROR: {error_msg}")
            return {"program": None, "status": "error", "message": error_msg}
            
        if not description.strip():
            error_msg = "Description is required and cannot be empty"
            print(f"❌ VALIDATION ERROR: {error_msg}")
            return {"program": None, "status": "error", "message": error_msg}
        
        print("✅ Validation passed, proceeding to database save...")
        
        # Save to database
        print("💾 DATABASE SAVE OPERATION:")
        new_program = create_program_content_master(session_name_l1, session_name_l2, description)
        
        if new_program:
            print(f"✅ DATABASE SUCCESS: {new_program}")
            result = {"program": new_program, "status": "success", "message": "Program created successfully"}
            print(f"📤 RETURNING: {result}")
            return result
        else:
            error_msg = "Database save failed"
            print(f"❌ DATABASE ERROR: {error_msg}")
            result = {"program": None, "status": "error", "message": error_msg}
            print(f"📤 RETURNING: {result}")
            return result
        
    except Exception as e:
        error_msg = f"CRITICAL EXCEPTION: {str(e)}"
        print(f"❌ {error_msg}")
        print(f"❌ Exception type: {type(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        result = {"program": None, "status": "error", "message": error_msg}
        print(f"📤 RETURNING: {result}")
        return result
    finally:
        print("=" * 80)
        print("🏁 END OF REQUEST PROCESSING")
        print("=" * 80)

@app.put("/api/ProgramsContentMaster/{program_id}")
async def update_program_content_master_api(program_id: int, request: Request):
    """Update program content master - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/ProgramsContentMaster/{program_id} called")
        print("=" * 80)
        
        # Log all headers
        print("Request Headers:")
        for key, value in request.headers.items():
            print(f"  {key}: {value}")
        
        content_type = request.headers.get('content-type', '')
        print(f"Content-Type: '{content_type}'")
        print(f"Content-Length: {request.headers.get('content-length', 'unknown')}")
        
        # Log raw body for debugging
        try:
            body = await request.body()
            print(f"Raw Body (first 500 chars): {body[:500]}")
            print(f"Raw Body Length: {len(body)}")
            
            # Reset the request body for further processing
            async def receive():
                return {"type": "http.request", "body": body, "more_body": False}
            request._receive = receive
            
        except Exception as e:
            print(f"Error reading raw body: {e}")
        
        session_name_l1 = ""
        session_name_l2 = ""
        description = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"FormData fields: {list(form_data.keys())}")
                
                for key, value in form_data.items():
                    print(f"  {key}: {value} (type: {type(value)})")
                
                session_name_l1 = str(form_data.get("SessionNameL1", ""))
                session_name_l2 = str(form_data.get("SessionNameL2", ""))
                description = str(form_data.get("Description", ""))
                
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/x-www-form-urlencoded' in content_type.lower():
            print("Processing as form-urlencoded")
            try:
                form_data = await request.form()
                print(f"Form data: {dict(form_data)}")
                session_name_l1 = str(form_data.get("SessionNameL1", ""))
                session_name_l2 = str(form_data.get("SessionNameL2", ""))
                description = str(form_data.get("Description", ""))
            except Exception as e:
                print(f"Error parsing form-urlencoded: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            print("Processing as JSON")
            try:
                json_data = await request.json()
                print(f"JSON data: {json_data}")
                
                # Handle both direct JSON and wrapped JSON
                if "ProgramsContentMaster" in json_data:
                    program_data = json_data["ProgramsContentMaster"]
                    session_name_l1 = str(program_data.get("SessionNameL1", ""))
                    session_name_l2 = str(program_data.get("SessionNameL2", ""))
                    description = str(program_data.get("Description", ""))
                else:
                    session_name_l1 = str(json_data.get("SessionNameL1", ""))
                    session_name_l2 = str(json_data.get("SessionNameL2", ""))
                    description = str(json_data.get("Description", ""))
                    
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            print(f"Unknown content type: {content_type}")
            # Try fallback methods
            try:
                form_data = await request.form()
                print(f"Fallback FormData: {dict(form_data)}")
                session_name_l1 = str(form_data.get("SessionNameL1", ""))
                session_name_l2 = str(form_data.get("SessionNameL2", ""))
                description = str(form_data.get("Description", ""))
            except:
                print("FormData failed")
                try:
                    json_data = await request.json()
                    print(f"Fallback JSON: {json_data}")
                    session_name_l1 = str(json_data.get("SessionNameL1", ""))
                    session_name_l2 = str(json_data.get("SessionNameL2", ""))
                    description = str(json_data.get("Description", ""))
                except:
                    print("JSON also failed")
                    return {"program": None, "status": "error", "message": "Could not parse request data"}
        
        print("=" * 50)
        print("EXTRACTED DATA ANALYSIS:")
        print(f"  SessionNameL1: '{session_name_l1}' (length: {len(session_name_l1)}, empty: {not session_name_l1})")
        print(f"  SessionNameL2: '{session_name_l2}' (length: {len(session_name_l2)}, empty: {not session_name_l2})")
        print(f"  Description: '{description}' (length: {len(description)}, empty: {not description})")
        print("=" * 50)
        
        # Validate required fields
        if not session_name_l1.strip():
            error_msg = "SessionNameL1 is required and cannot be empty"
            print(f"VALIDATION ERROR: {error_msg}")
            return {"program": None, "status": "error", "message": error_msg}
            
        if not description.strip():
            error_msg = "Description is required and cannot be empty"
            print(f"VALIDATION ERROR: {error_msg}")
            return {"program": None, "status": "error", "message": error_msg}
        
        print("Validation passed, proceeding to database update...")
        
        # Update in database
        print("DATABASE UPDATE OPERATION:")
        updated_program = update_program_content_master(program_id, session_name_l1, session_name_l2, description)
        
        if updated_program:
            print(f"DATABASE SUCCESS: {updated_program}")
            result = {"program": updated_program, "status": "success", "message": "Program updated successfully"}
            print(f"RETURNING: {result}")
            return result
        else:
            error_msg = "Database update failed - program not found or no changes made"
            print(f"DATABASE ERROR: {error_msg}")
            result = {"program": None, "status": "error", "message": error_msg}
            print(f"RETURNING: {result}")
            return result
        
    except Exception as e:
        error_msg = f"CRITICAL EXCEPTION: {str(e)}"
        print(f"{error_msg}")
        print(f"Exception type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        result = {"program": None, "status": "error", "message": error_msg}
        print(f"RETURNING: {result}")
        return result
    finally:
        print("=" * 80)
        print("END OF REQUEST PROCESSING")
        print("=" * 80)

@app.delete("/api/ProgramsContentMaster/{program_id}")
async def delete_program_content_master_api(program_id: int):
    """Delete program content master - API endpoint"""
    try:
        print(f"🗑️ DELETE /api/ProgramsContentMaster/{program_id} called")
        
        # Delete from database
        success = delete_program_content_master(program_id)
        
        if success:
            print(f"✅ Program {program_id} deleted successfully")
            return {"status": "success", "message": "Program deleted successfully"}
        else:
            error_msg = f"Program {program_id} not found"
            print(f"❌ DELETE ERROR: {error_msg}")
            return {"status": "error", "message": error_msg}
        
    except Exception as e:
        error_msg = f"Exception occurred: {str(e)}"
        print(f"❌ {error_msg}")
        return {"status": "error", "message": error_msg}

@app.get("/api/ProgramsContentDetail")
async def get_programs_content_detail_api():
    """Get programs content detail data - API endpoint"""
    try:
        program_details = get_all_program_details()
        return {"program_details": program_details, "status": "success"}
    except Exception as e:
        return {"program_details": [], "status": "error", "message": str(e)}

@app.post("/api/ProgramsContentDetail")
async def create_program_content_detail_api(request: Request):
    """Create new program content detail - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/ProgramsContentDetail called")
        print("=" * 80)
        
        # Log all headers
        print("📋 Request Headers:")
        for key, value in request.headers.items():
            print(f"  {key}: {value}")
        
        content_type = request.headers.get('content-type', '')
        print(f"📋 Content-Type: '{content_type}'")
        
        program_id = ""
        title = ""
        content = ""
        session_video = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                for key, value in form_data.items():
                    print(f"  {key}: {value} (type: {type(value)})")
                
                program_id = str(form_data.get("ProgramsContentMasterId", ""))
                title = str(form_data.get("Title", ""))
                content = str(form_data.get("Description", ""))
                session_video = str(form_data.get("SessionVideo", ""))
                
            except Exception as e:
                print(f"❌ Error processing FormData: {e}")
                
        elif content_type and 'application/x-www-form-urlencoded' in content_type.lower():
            print("🔧 Processing as application/x-www-form-urlencoded")
            try:
                form_data = await request.form()
                print(f"📋 Form fields: {list(form_data.keys())}")
                
                for key, value in form_data.items():
                    print(f"  {key}: {value} (type: {type(value)})")
                
                program_id = str(form_data.get("ProgramsContentMasterId", ""))
                title = str(form_data.get("Title", ""))
                content = str(form_data.get("Description", ""))
                session_video = str(form_data.get("SessionVideo", ""))
                
            except Exception as e:
                print(f"❌ Error processing form-urlencoded: {e}")
                
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as application/json")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                program_id = str(json_data.get("ProgramsContentMasterId", ""))
                title = str(json_data.get("Title", ""))
                content = str(json_data.get("Description", ""))
                session_video = str(json_data.get("SessionVideo", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON: {e}")
        else:
            print("🔧 Unknown content type, trying all methods...")
            
            # Try FormData first
            try:
                form_data = await request.form()
                print(f"📋 Fallback FormData: {dict(form_data)}")
                program_id = str(form_data.get("ProgramsContentMasterId", ""))
                title = str(form_data.get("Title", ""))
                content = str(form_data.get("Description", ""))
                session_video = str(form_data.get("SessionVideo", ""))
            except:
                print("❌ FormData failed")
                
                # Try JSON
                try:
                    json_data = await request.json()
                    print(f"📋 Fallback JSON: {json_data}")
                    program_id = str(json_data.get("ProgramsContentMasterId", ""))
                    title = str(json_data.get("Title", ""))
                    content = str(json_data.get("Description", ""))
                    session_video = str(json_data.get("SessionVideo", ""))
                except:
                    print("❌ JSON also failed")
                    return {"program_detail": None, "status": "error", "message": "Could not parse request data"}
        
        print("=" * 50)
        print("📝 EXTRACTED DATA ANALYSIS:")
        print(f"  ProgramsContentMasterId: '{program_id}' (length: {len(program_id)}, empty: {not program_id})")
        print(f"  Title: '{title}' (length: {len(title)}, empty: {not title})")
        print(f"  Description: '{content}' (length: {len(content)}, empty: {not content})")
        print(f"  SessionVideo: '{session_video}' (length: {len(session_video)}, empty: {not session_video})")
        print("=" * 50)
        
        # Validate required fields
        if not program_id.strip():
            error_msg = "ProgramsContentMasterId is required and cannot be empty"
            print(f"❌ VALIDATION ERROR: {error_msg}")
            return {"program_detail": None, "status": "error", "message": error_msg}
            
        if not title.strip():
            error_msg = "Title is required and cannot be empty"
            print(f"❌ VALIDATION ERROR: {error_msg}")
            return {"program_detail": None, "status": "error", "message": error_msg}
        
        print("✅ Validation passed, proceeding to database save...")
        
        # Save to database
        print("💾 DATABASE SAVE OPERATION:")
        new_program_detail = create_program_content_detail(int(program_id), title, content, session_video)
        
        if new_program_detail:
            print(f"✅ DATABASE SUCCESS: {new_program_detail}")
            result = {"program_detail": new_program_detail, "status": "success", "message": "Program detail created successfully"}
            print(f"📤 RETURNING: {result}")
            return result
        else:
            error_msg = "Database save failed"
            print(f"❌ DATABASE ERROR: {error_msg}")
            result = {"program_detail": None, "status": "error", "message": error_msg}
            print(f"📤 RETURNING: {result}")
            return result
        
    except Exception as e:
        error_msg = f"CRITICAL EXCEPTION: {str(e)}"
        print(f"❌ {error_msg}")
        print(f"❌ Exception type: {type(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        result = {"program_detail": None, "status": "error", "message": error_msg}
        print(f"📤 RETURNING: {result}")
        return result
    finally:
        print("=" * 80)
        print("🏁 END OF REQUEST PROCESSING")
        print("=" * 80)

@app.delete("/api/ProgramsContentDetail/{detail_id}")
async def delete_program_content_detail_api(detail_id: int):
    """Delete program content detail - API endpoint"""
    try:
        print(f"DELETE /api/ProgramsContentDetail/{detail_id} called")
        
        # Delete from database
        success = delete_program_content_detail(detail_id)
        
        if success:
            print(f"Program detail {detail_id} deleted successfully")
            return {"status": "success", "message": "Program detail deleted successfully"}
        else:
            error_msg = f"Program detail {detail_id} not found"
            print(f"DELETE ERROR: {error_msg}")
            return {"status": "error", "message": error_msg}
        
    except Exception as e:
        error_msg = f"Exception occurred: {str(e)}"
        print(f"{error_msg}")
        return {"status": "error", "message": error_msg}

@app.put("/api/ProgramsContentDetail/{detail_id}")
async def update_program_content_detail_api(detail_id: int, request: Request):
    """Update program content detail - API endpoint"""
    try:
        print("=" * 80)
        print(f"PUT /api/ProgramsContentDetail/{detail_id} called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        program_id = ""
        title = ""
        content = ""
        session_video = ""
        order_index = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            try:
                form_data = await request.form()
                program_id = str(form_data.get("ProgramsContentMasterId", ""))
                title = str(form_data.get("Title", ""))
                content = str(form_data.get("Description", ""))
                session_video = str(form_data.get("SessionVideo", ""))
                order_index = str(form_data.get("OrderIndex", ""))
            except Exception as e:
                print(f"Error parsing multipart: {e}")
        
        elif content_type and 'application/json' in content_type.lower():
            try:
                json_data = await request.json()
                program_id = str(json_data.get("ProgramsContentMasterId", ""))
                title = str(json_data.get("Title", ""))
                content = str(json_data.get("Description", ""))
                session_video = str(json_data.get("SessionVideo", ""))
                order_index = str(json_data.get("OrderIndex", ""))
            except Exception as e:
                print(f"Error parsing JSON: {e}")
        
        else:
            try:
                form_data = await request.form()
                program_id = str(form_data.get("ProgramsContentMasterId", ""))
                title = str(form_data.get("Title", ""))
                content = str(form_data.get("Description", ""))
                session_video = str(form_data.get("SessionVideo", ""))
                order_index = str(form_data.get("OrderIndex", ""))
            except:
                return {"program_detail": None, "status": "error", "message": "Could not parse request data"}
        
        # Update in database
        updated_detail = update_program_content_detail(detail_id, int(program_id) if program_id else 0, title, content, session_video, int(order_index) if order_index else 0)
        
        if updated_detail:
            return {"program_detail": updated_detail, "status": "success", "message": "Program detail updated successfully"}
        else:
            return {"program_detail": None, "status": "error", "message": "Failed to update program detail"}
        
    except Exception as e:
        return {"program_detail": None, "status": "error", "message": str(e)}

@app.get("/api/CountryCode")
async def get_country_code_api():
    """Get country codes - API endpoint"""
    try:
        # Return empty list for now as table doesn't exist
        return {"countries": [], "status": "success"}
    except Exception as e:
        return {"countries": [], "status": "error", "message": str(e)}

@app.get("/api/GovernorateCode")
async def get_governorate_code_api():
    """Get governorate codes - API endpoint"""
    try:
        governorates = get_all_governorates()
        return {"governorates": governorates, "status": "success"}
    except Exception as e:
        return {"governorates": [], "status": "error", "message": str(e)}

@app.get("/api/CityCode")
async def get_city_code_api():
    """Get city codes - API endpoint"""
    try:
        # Return empty list for now as table doesn't exist
        return {"cities": [], "status": "success"}
    except Exception as e:
        return {"cities": [], "status": "error", "message": str(e)}

@app.get("/api/ComplaintsStudent")
async def get_complaints_student_api():
    """Get student complaints - API endpoint"""
    try:
        complaints = get_all_complaints()
        return {"complaints": complaints, "status": "success"}
    except Exception as e:
        return {"complaints": [], "status": "error", "message": str(e)}

@app.post("/api/ComplaintsStudent")
async def create_complaints_student_api(request: Request):
    """Create new student complaint - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/ComplaintsStudent called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        complaint_id = ""
        student_id = ""
        complaint_type_id = ""
        status_id = ""
        complaint_title = ""
        complaint_description = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                complaint_id = str(form_data.get("ComplaintId", ""))
                student_id = str(form_data.get("StudentId", ""))
                complaint_type_id = str(form_data.get("ComplaintTypeId", ""))
                status_id = str(form_data.get("StatusId", "1"))
                complaint_title = str(form_data.get("ComplaintTitle", ""))
                complaint_description = str(form_data.get("ComplaintDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                complaint_id = str(json_data.get("ComplaintId", ""))
                student_id = str(json_data.get("StudentId", ""))
                complaint_type_id = str(json_data.get("ComplaintTypeId", ""))
                status_id = str(json_data.get("StatusId", "1"))
                complaint_title = str(json_data.get("ComplaintTitle", ""))
                complaint_description = str(json_data.get("ComplaintDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                complaint_id = str(form_data.get("ComplaintId", ""))
                student_id = str(form_data.get("StudentId", ""))
                complaint_type_id = str(form_data.get("ComplaintTypeId", ""))
                status_id = str(form_data.get("StatusId", "1"))
                complaint_title = str(form_data.get("ComplaintTitle", ""))
                complaint_description = str(form_data.get("ComplaintDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted complaint data: id='{complaint_id}', student_id='{student_id}', complaint_type_id='{complaint_type_id}', status_id='{status_id}', title='{complaint_title}', description='{complaint_description}'")
        
        # Validate required fields
        if not complaint_title.strip():
            return {"status": "error", "message": "Complaint title is required"}
        
        # Generate complaint ID if not provided
        if not complaint_id.strip():
            import uuid
            complaint_id = str(uuid.uuid4())
        
        # Create complaint in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO complaints_student (id, student_id, complaint_type_id, status_id, title, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            complaint_id,
            int(student_id) if student_id.isdigit() else None,
            int(complaint_type_id) if complaint_type_id.isdigit() else None,
            int(status_id) if status_id.isdigit() else 1,
            complaint_title,
            complaint_description if complaint_description.strip() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get created complaint
        cursor.execute("SELECT * FROM complaints_student WHERE id = ?", (complaint_id,))
        complaint = cursor.fetchone()
        conn.close()
        
        if complaint:
            result = dict(complaint)
            print(f"✅ Retrieved created complaint: {result}")
            return {"complaint": result, "status": "success"}
        else:
            print("❌ No complaint retrieved after insert")
            return {"status": "error", "message": "Failed to create complaint"}
            
    except Exception as e:
        print(f"❌ Error in create_complaints_student_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.get("/api/ComplaintsType")
async def get_complaints_type_api():
    """Get complaint types - API endpoint"""
    try:
        complaint_types = get_all_complaint_types()
        return {"complaint_types": complaint_types, "status": "success"}
    except Exception as e:
        return {"complaint_types": [], "status": "error", "message": str(e)}

@app.post("/api/ComplaintsType")
async def create_complaints_type_api(request: Request):
    """Create new complaint type - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/ComplaintsType called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        type_name = ""
        type_description = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                type_name = str(form_data.get("TypeName", ""))
                type_description = str(form_data.get("TypeDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                type_name = str(json_data.get("TypeName", ""))
                type_description = str(json_data.get("TypeDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                type_name = str(form_data.get("TypeName", ""))
                type_description = str(form_data.get("TypeDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted complaint type data: name='{type_name}', description='{type_description}'")
        
        # Validate required fields
        if not type_name.strip():
            return {"status": "error", "message": "Type name is required"}
        
        # Create type in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO complaints_type (name, description, active)
            VALUES (?, ?, 1)
        """, (
            type_name,
            type_description if type_description.strip() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get created type
        cursor.execute("SELECT * FROM complaints_type WHERE rowid = last_insert_rowid()")
        type_record = cursor.fetchone()
        conn.close()
        
        if type_record:
            result = dict(type_record)
            print(f"✅ Retrieved created complaint type: {result}")
            return {"complaint_type": result, "status": "success"}
        else:
            print("❌ No complaint type retrieved after insert")
            return {"status": "error", "message": "Failed to create complaint type"}
            
    except Exception as e:
        print(f"❌ Error in create_complaints_type_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.get("/api/ComplaintsStatus")
async def get_complaints_status_api():
    """Get complaint status - API endpoint"""
    try:
        complaint_status = get_all_complaint_status()
        return {"complaint_status": complaint_status, "status": "success"}
    except Exception as e:
        return {"complaint_status": [], "status": "error", "message": str(e)}

@app.post("/api/ComplaintsStatus")
async def create_complaints_status_api(request: Request):
    """Create new complaint status - API endpoint"""
    try:
        print("=" * 80)
        print("🔍 POST /api/ComplaintsStatus called")
        print("=" * 80)
        
        content_type = request.headers.get('content-type', '')
        
        status_name = ""
        status_description = ""
        
        # Handle different content types
        if content_type and 'multipart/form-data' in content_type.lower():
            print("🔧 Processing as multipart/form-data")
            try:
                form_data = await request.form()
                print(f"📋 FormData fields: {list(form_data.keys())}")
                
                status_name = str(form_data.get("StatusName", ""))
                status_description = str(form_data.get("StatusDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        elif content_type and 'application/json' in content_type.lower():
            print("🔧 Processing as JSON")
            try:
                json_data = await request.json()
                print(f"📋 JSON data: {json_data}")
                
                status_name = str(json_data.get("StatusName", ""))
                status_description = str(json_data.get("StatusDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing JSON data: {e}")
                return {"status": "error", "message": f"Error processing JSON data: {str(e)}"}
        
        else:
            print("🔧 Processing as URL-encoded form data")
            try:
                form_data = await request.form()
                print(f"📋 Form data fields: {list(form_data.keys())}")
                
                status_name = str(form_data.get("StatusName", ""))
                status_description = str(form_data.get("StatusDescription", ""))
                
            except Exception as e:
                print(f"❌ Error processing form data: {e}")
                return {"status": "error", "message": f"Error processing form data: {str(e)}"}
        
        print(f"🔧 Extracted complaint status data: name='{status_name}', description='{status_description}'")
        
        # Validate required fields
        if not status_name.strip():
            return {"status": "error", "message": "Status name is required"}
        
        # Create status in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO complaints_status (name, description, active)
            VALUES (?, ?, 1)
        """, (
            status_name,
            status_description if status_description.strip() else None
        ))
        
        conn.commit()
        print("✅ Database insert committed")
        
        # Get created status
        cursor.execute("SELECT * FROM complaints_status WHERE rowid = last_insert_rowid()")
        status_record = cursor.fetchone()
        conn.close()
        
        if status_record:
            result = dict(status_record)
            print(f"✅ Retrieved created complaint status: {result}")
            return {"complaint_status": result, "status": "success"}
        else:
            print("❌ No complaint status retrieved after insert")
            return {"status": "error", "message": "Failed to create complaint status"}
            
    except Exception as e:
        print(f"❌ Error in create_complaints_status_api: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.get("/api/StudentEvaluation")
async def get_student_evaluation_api():
    """Get student evaluation data - API endpoint"""
    try:
        evaluations = get_all_evaluations()
        return {"evaluations": evaluations, "status": "success"}
    except Exception as e:
        return {"evaluations": [], "status": "error", "message": str(e)}

@app.get("/api/StudentAttend")
async def get_student_attend_api():
    """Get student attendance data - API endpoint"""
    try:
        attendance = get_all_attendance()
        return {"attendance": attendance, "status": "success"}
    except Exception as e:
        return {"attendance": [], "status": "error", "message": str(e)}

@app.get("/api/Account/profile-picture/{user_id}")
async def get_profile_picture(user_id: int):
    """Get user profile picture - API endpoint"""
    # For now, return 404 as no profile pictures are stored
    raise HTTPException(status_code=404, detail="Profile picture not found")

@app.post("/api/Account/register")
async def register(register_data: RegisterRequest):
    """Register new user"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM student_data WHERE email = ?", (register_data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        cursor.execute("SELECT id FROM teacher_data WHERE email = ?", (register_data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Insert new student (default role)
        cursor.execute("""
            INSERT INTO student_data (email, name, firstName, lastName, phone, enrollment_date, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (
            register_data.email,
            f"{register_data.firstName} {register_data.lastName}",
            register_data.firstName,
            register_data.lastName,
            register_data.phoneNumber,
            datetime.now().isoformat()
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        user_data = {
            "id": user_id,
            "email": register_data.email,
            "name": f"{register_data.firstName} {register_data.lastName}",
            "role": "Student",
            "firstName": register_data.firstName,
            "lastName": register_data.lastName
        }
        
        access_token = create_access_token(data=user_data)
        refresh_token = create_refresh_token(data=user_data)
        
        return TokenResponse(
            AccessToken=access_token,
            RefreshToken=refresh_token,
            ExpiresAt=(datetime.utcnow() + timedelta(hours=24)).isoformat(),
            user=user_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/Account/refresh-token")
async def refresh_token_endpoint(refresh_token: str):
    """Refresh access token"""
    try:
        # Decode refresh token
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        # Create new access token
        user_data = {
            "id": payload.get("id"),
            "email": payload.get("email"),
            "name": payload.get("name"),
            "role": payload.get("role")
        }
        
        access_token = create_access_token(data=user_data)
        new_refresh_token = create_refresh_token(data=user_data)
        
        return TokenResponse(
            AccessToken=access_token,
            RefreshToken=new_refresh_token,
            ExpiresAt=(datetime.utcnow() + timedelta(hours=24)).isoformat(),
            user=user_data
        )
        
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Update functions for all entities
def update_academy_data(academy_id: int, name: str, description: str, address: str, phone: str, email: str, website: str):
    """Update academy data in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE academy_data 
            SET name = ?, description = ?, address = ?, phone = ?, email = ?, website = ?
            WHERE id = ?
        """, (name, description, address, phone, email, website, academy_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM academy_data WHERE id = ?", (academy_id,))
            academy = cursor.fetchone()
            conn.close()
            return dict(academy) if academy else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_academy_data: {str(e)}")
        return None

def update_branch_data(branch_id: int, academy_id: int, name: str, address: str, phone: str, email: str, governorate_id: int, city_id: int):
    """Update branch data in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE branch_data 
            SET academy_id = ?, name = ?, address = ?, phone = ?, email = ?, governorate_id = ?, city_id = ?
            WHERE id = ? AND active = 1
        """, (academy_id, name, address, phone, email, governorate_id, city_id, branch_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM branch_data WHERE id = ?", (branch_id,))
            branch = cursor.fetchone()
            conn.close()
            return dict(branch) if branch else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_branch_data: {str(e)}")
        return None

def update_student_data(student_id: int, name: str, email: str, phone: str, address: str, birth_date: str, enrollment_date: str):
    """Update student data in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE student_data 
            SET name = ?, email = ?, phone = ?, address = ?, birth_date = ?, enrollment_date = ?
            WHERE id = ? AND active = 1
        """, (name, email, phone, address, birth_date, enrollment_date, student_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM student_data WHERE id = ?", (student_id,))
            student = cursor.fetchone()
            conn.close()
            return dict(student) if student else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_student_data: {str(e)}")
        return None

def update_teacher_data(teacher_id: int, name: str, email: str, phone: str, specialization: str, experience_years: int, bio: str, image_url: str):
    """Update teacher data in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE teacher_data 
            SET name = ?, email = ?, phone = ?, specialization = ?, experience_years = ?, bio = ?, image_url = ?
            WHERE id = ? AND active = 1
        """, (name, email, phone, specialization, experience_years, bio, image_url, teacher_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM teacher_data WHERE id = ?", (teacher_id,))
            teacher = cursor.fetchone()
            conn.close()
            return dict(teacher) if teacher else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_teacher_data: {str(e)}")
        return None

def update_academy_clase_master(master_id: int, name: str, description: str):
    """Update academy class master in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE academy_clase_master 
            SET name = ?, description = ?
            WHERE id = ? AND active = 1
        """, (name, description, master_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM academy_clase_master WHERE id = ?", (master_id,))
            master = cursor.fetchone()
            conn.close()
            return dict(master) if master else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_academy_clase_master: {str(e)}")
        return None

def update_academy_clase_type(type_id: int, name: str, description: str):
    """Update academy class type in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE academy_clase_type 
            SET name = ?, description = ?
            WHERE id = ? AND active = 1
        """, (name, description, type_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM academy_clase_type WHERE id = ?", (type_id,))
            type_data = cursor.fetchone()
            conn.close()
            return dict(type_data) if type_data else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_academy_clase_type: {str(e)}")
        return None

def update_academy_job(job_id: int, title: str, description: str, requirements: str, salary_range: str, location: str, type: str):
    """Update academy job in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE academy_job 
            SET title = ?, description = ?, requirements = ?, salary_range = ?, location = ?, type = ?
            WHERE id = ? AND active = 1
        """, (title, description, requirements, salary_range, location, type, job_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM academy_job WHERE id = ?", (job_id,))
            job = cursor.fetchone()
            conn.close()
            return dict(job) if job else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_academy_job: {str(e)}")
        return None

def update_projects_master(project_id: int, name: str, description: str, category: str, status: str, start_date: str, end_date: str, image_url: str):
    """Update projects master in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE projects_master 
            SET name = ?, description = ?, category = ?, status = ?, start_date = ?, end_date = ?, image_url = ?
            WHERE id = ? AND active = 1
        """, (name, description, category, status, start_date, end_date, image_url, project_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM projects_master WHERE id = ?", (project_id,))
            project = cursor.fetchone()
            conn.close()
            return dict(project) if project else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_projects_master: {str(e)}")
        return None

def update_projects_detail(detail_id: int, project_id: int, title: str, content: str, order_index: int):
    """Update projects detail in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE projects_detail 
            SET project_id = ?, title = ?, content = ?, order_index = ?
            WHERE id = ? AND active = 1
        """, (project_id, title, content, order_index, detail_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM projects_detail WHERE id = ?", (detail_id,))
            detail = cursor.fetchone()
            conn.close()
            return dict(detail) if detail else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_projects_detail: {str(e)}")
        return None

def update_program_content_detail(detail_id: int, program_id: int, title: str, content: str, session_video: str, order_index: int):
    """Update program content detail in database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE programs_content_detail 
            SET program_id = ?, title = ?, content = ?, session_video = ?, order_index = ?
            WHERE id = ? AND active = 1
        """, (program_id, title, content, session_video, order_index, detail_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT * FROM programs_content_detail WHERE id = ?", (detail_id,))
            detail = cursor.fetchone()
            conn.close()
            return dict(detail) if detail else None
        conn.close()
        return None
        
    except Exception as e:
        print(f"Database error in update_program_content_detail: {str(e)}")
        return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

