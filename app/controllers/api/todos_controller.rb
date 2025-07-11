class Api::TodosController < ApplicationController
  before_action :set_todo, only: [:show, :update, :destroy]
  
  # GET /api/todos
  def index
    @todos = Todo.all.order(created_at: :desc)
    render json: @todos
  end
  
  # GET /api/todos/stats
  def stats
    total_count = Todo.count
    completed_count = Todo.completed.count
    pending_count = Todo.pending.count
    completion_rate = total_count > 0 ? (completed_count.to_f / total_count * 100).round(1) : 0
    
    render json: {
      total: total_count,
      completed: completed_count,
      pending: pending_count,
      completion_rate: completion_rate
    }
  end
  
  # GET /api/todos/1
  def show
    render json: @todo
  end

  # POST /api/todos
  def create
    @todo = Todo.new(todo_params)
    
    if @todo.save
      render json: @todo, status: :created
    else
      render json: { errors: @todo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/todos/1
  def update
    if @todo.update(todo_params)
      render json: @todo
    else
      render json: { errors: @todo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/todos/1
  def destroy
    @todo.destroy
    head :no_content
  end
  
  private
  
  def set_todo
    @todo = Todo.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Todo not found' }, status: :not_found
  end
  
  def todo_params
    params.require(:todo).permit(:title, :completed)
  end
end
