-- 创建一个SQL函数，用于获取按端点分组的请求数
CREATE OR REPLACE FUNCTION get_endpoint_counts(limit_count integer)
RETURNS TABLE (
  endpoint text,
  count bigint
) 
LANGUAGE SQL
AS $$
  SELECT 
    endpoint,
    COUNT(*) as count
  FROM 
    api_logs
  GROUP BY 
    endpoint
  ORDER BY 
    count DESC
  LIMIT limit_count;
$$;
