#!/usr/bin/env python3
"""
🚀 SQL Query Optimization Script
Analyze and optimize slow queries with EXPLAIN ANALYZE
"""

import time
import sqlite3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import engine, SessionLocal, User
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SQLOptimizer:
    def __init__(self):
        self.engine = engine
        self.SessionLocal = SessionLocal
        
    def explain_query(self, query: str, params: dict = None) -> dict:
        """Execute EXPLAIN QUERY PLAN and measure execution time."""
        with self.engine.connect() as conn:
            # Get query plan
            explain_query = f"EXPLAIN QUERY PLAN {query}"
            explain_result = conn.execute(text(explain_query), params or {})
            plan = [dict(row._mapping) for row in explain_result]
            
            # Measure execution time
            start_time = time.time()
            result = conn.execute(text(query), params or {})
            rows = result.fetchall()
            end_time = time.time()
            
            execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            return {
                'query': query,
                'execution_time_ms': round(execution_time, 3),
                'row_count': len(rows),
                'query_plan': plan
            }
    
    def create_test_data(self):
        """Create test data for performance testing."""
        db = self.SessionLocal()
        try:
            # Check if data already exists
            user_count = db.query(User).count()
            if user_count >= 1000:
                logger.info(f"Test data already exists: {user_count} users")
                return
                
            logger.info("Creating test data...")
            
            # Create test users
            test_users = []
            for i in range(1000):
                test_users.append(User(
                    email=f"test{i}@example.com",
                    hashed_password="$2b$12$test_hash",
                    name=f"Test User {i}",
                    bio=f"Bio for user {i}",
                    is_active=i % 10 != 0  # 90% active, 10% inactive
                ))
            
            # Bulk insert for better performance
            db.bulk_save_objects(test_users)
            db.commit()
            logger.info(f"Created {len(test_users)} test users")
            
        finally:
            db.close()
    
    def analyze_slow_queries(self):
        """Analyze potentially slow queries before optimization."""
        logger.info("🔍 ANALYZING SLOW QUERIES - BEFORE OPTIMIZATION")
        logger.info("=" * 60)
        
        queries_to_analyze = [
            {
                'name': 'Find user by email (no index on email)',
                'query': "SELECT * FROM users WHERE email = :email",
                'params': {'email': 'test500@example.com'}
            },
            {
                'name': 'Find active users (no index on is_active)',
                'query': "SELECT * FROM users WHERE is_active = 1",
                'params': {}
            },
            {
                'name': 'Find users by name pattern (no index on name)',
                'query': "SELECT * FROM users WHERE name LIKE :pattern",
                'params': {'pattern': '%User 5%'}
            },
            {
                'name': 'Find users created in date range',
                'query': "SELECT * FROM users WHERE created_at > :start_date",
                'params': {'start_date': '2024-01-01'}
            },
            {
                'name': 'Count active users by email domain',
                'query': """
                    SELECT substr(email, instr(email, '@') + 1) as domain, 
                           COUNT(*) as count 
                    FROM users 
                    WHERE is_active = 1 
                    GROUP BY domain
                """,
                'params': {}
            }
        ]
        
        results = {}
        for query_info in queries_to_analyze:
            try:
                result = self.explain_query(query_info['query'], query_info['params'])
                results[query_info['name']] = result
                
                logger.info(f"\n📊 {query_info['name']}")
                logger.info(f"⏱️  Execution time: {result['execution_time_ms']}ms")
                logger.info(f"📈 Rows returned: {result['row_count']}")
                logger.info("🔍 Query Plan:")
                for step in result['query_plan']:
                    logger.info(f"   {step}")
                    
            except Exception as e:
                logger.error(f"Error analyzing query '{query_info['name']}': {e}")
        
        return results
    
    def create_optimized_indexes(self):
        """Create indexes to optimize slow queries."""
        logger.info("\n🔧 CREATING OPTIMIZED INDEXES")
        logger.info("=" * 40)
        
        indexes_to_create = [
            {
                'name': 'idx_users_email_unique',
                'query': "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email)",
                'purpose': 'Optimize email lookups for authentication'
            },
            {
                'name': 'idx_users_is_active',
                'query': "CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)",
                'purpose': 'Optimize active user queries'
            },
            {
                'name': 'idx_users_created_at',
                'query': "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)",
                'purpose': 'Optimize date range queries'
            },
            {
                'name': 'idx_users_name',
                'query': "CREATE INDEX IF NOT EXISTS idx_users_name ON users(name)",
                'purpose': 'Optimize name-based searches'
            },
            {
                'name': 'idx_users_composite_active_email',
                'query': "CREATE INDEX IF NOT EXISTS idx_users_composite_active_email ON users(is_active, email)",
                'purpose': 'Optimize combined active status and email queries'
            }
        ]
        
        with self.engine.connect() as conn:
            for index_info in indexes_to_create:
                try:
                    start_time = time.time()
                    conn.execute(text(index_info['query']))
                    conn.commit()
                    end_time = time.time()
                    
                    creation_time = (end_time - start_time) * 1000
                    logger.info(f"✅ {index_info['name']}: {creation_time:.2f}ms")
                    logger.info(f"   Purpose: {index_info['purpose']}")
                    
                except Exception as e:
                    logger.error(f"❌ Failed to create {index_info['name']}: {e}")
    
    def analyze_optimized_queries(self):
        """Analyze queries after optimization."""
        logger.info("\n🚀 ANALYZING QUERIES - AFTER OPTIMIZATION")
        logger.info("=" * 50)
        
        # Same queries as before but now with indexes
        optimized_queries = [
            {
                'name': 'Find user by email (WITH index)',
                'query': "SELECT * FROM users WHERE email = :email",
                'params': {'email': 'test500@example.com'}
            },
            {
                'name': 'Find active users (WITH index)',
                'query': "SELECT * FROM users WHERE is_active = 1 LIMIT 100",
                'params': {}
            },
            {
                'name': 'Find users by name pattern (WITH index)',
                'query': "SELECT * FROM users WHERE name LIKE :pattern LIMIT 50",
                'params': {'pattern': '%User 5%'}
            },
            {
                'name': 'Find users created in date range (WITH index)',
                'query': "SELECT * FROM users WHERE created_at > :start_date LIMIT 100",
                'params': {'start_date': '2024-01-01'}
            },
            {
                'name': 'Optimized active users count',
                'query': """
                    SELECT substr(email, instr(email, '@') + 1) as domain, 
                           COUNT(*) as count 
                    FROM users 
                    WHERE is_active = 1 
                    GROUP BY domain 
                    ORDER BY count DESC
                """,
                'params': {}
            }
        ]
        
        results = {}
        for query_info in optimized_queries:
            try:
                result = self.explain_query(query_info['query'], query_info['params'])
                results[query_info['name']] = result
                
                logger.info(f"\n📊 {query_info['name']}")
                logger.info(f"⏱️  Execution time: {result['execution_time_ms']}ms")
                logger.info(f"📈 Rows returned: {result['row_count']}")
                logger.info("🔍 Optimized Query Plan:")
                for step in result['query_plan']:
                    logger.info(f"   {step}")
                    
            except Exception as e:
                logger.error(f"Error analyzing optimized query '{query_info['name']}': {e}")
        
        return results
    
    def compare_performance(self, before_results: dict, after_results: dict):
        """Compare performance before and after optimization."""
        logger.info("\n📈 PERFORMANCE COMPARISON")
        logger.info("=" * 40)
        
        # Map similar queries for comparison
        comparisons = [
            ('Find user by email (no index on email)', 'Find user by email (WITH index)'),
            ('Find active users (no index on is_active)', 'Find active users (WITH index)'),
            ('Find users by name pattern (no index on name)', 'Find users by name pattern (WITH index)'),
            ('Find users created in date range', 'Find users created in date range (WITH index)'),
            ('Count active users by email domain', 'Optimized active users count')
        ]
        
        total_improvement = 0
        valid_comparisons = 0
        
        for before_key, after_key in comparisons:
            if before_key in before_results and after_key in after_results:
                before_time = before_results[before_key]['execution_time_ms']
                after_time = after_results[after_key]['execution_time_ms']
                
                if before_time > 0:
                    improvement = ((before_time - after_time) / before_time) * 100
                    total_improvement += improvement
                    valid_comparisons += 1
                    
                    logger.info(f"\n🔄 {before_key}")
                    logger.info(f"   Before: {before_time}ms")
                    logger.info(f"   After:  {after_time}ms")
                    if improvement > 0:
                        logger.info(f"   Improvement: {improvement:.1f}% faster ⚡")
                    elif improvement < -5:  # More than 5% slower
                        logger.info(f"   Regression: {abs(improvement):.1f}% slower ⚠️")
                    else:
                        logger.info(f"   Similar performance ({improvement:.1f}%)")
        
        if valid_comparisons > 0:
            avg_improvement = total_improvement / valid_comparisons
            logger.info(f"\n🎯 OVERALL PERFORMANCE IMPROVEMENT: {avg_improvement:.1f}%")
        
        return avg_improvement if valid_comparisons > 0 else 0
    
    def run_optimization_analysis(self):
        """Run complete optimization analysis."""
        logger.info("🚀 STARTING SQL OPTIMIZATION ANALYSIS")
        logger.info("=" * 60)
        
        try:
            # Step 1: Create test data
            self.create_test_data()
            
            # Step 2: Analyze slow queries (before)
            before_results = self.analyze_slow_queries()
            
            # Step 3: Create optimized indexes
            self.create_optimized_indexes()
            
            # Step 4: Analyze optimized queries (after)
            after_results = self.analyze_optimized_queries()
            
            # Step 5: Compare performance
            improvement = self.compare_performance(before_results, after_results)
            
            logger.info("\n✅ OPTIMIZATION ANALYSIS COMPLETE!")
            logger.info(f"🎯 Average Performance Improvement: {improvement:.1f}%")
            
            return {
                'before_results': before_results,
                'after_results': after_results,
                'improvement_percentage': improvement
            }
            
        except Exception as e:
            logger.error(f"Error during optimization analysis: {e}")
            raise

if __name__ == "__main__":
    optimizer = SQLOptimizer()
    results = optimizer.run_optimization_analysis()
