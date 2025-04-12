-- Function to force delete an analysis
CREATE OR REPLACE FUNCTION force_delete_analysis(p_analysis_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Disable triggers temporarily for this transaction
    ALTER TABLE food_analyses DISABLE TRIGGER ALL;
    
    -- Perform the deletion
    DELETE FROM food_analyses 
    WHERE id = p_analysis_id 
    AND user_id = p_user_id;
    
    -- Re-enable triggers
    ALTER TABLE food_analyses ENABLE TRIGGER ALL;
    
    -- Commit the transaction
    COMMIT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 